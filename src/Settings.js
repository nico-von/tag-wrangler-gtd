import { PluginSettingTab, Setting, AbstractInputSuggest } from "obsidian";
import { listTags } from "./plugin";
import { parse, stringify } from 'yaml'
import { Notice } from "obsidian";

const DEFAULT_OBJ = {
    tagname: '',
    viewtype: 'table',
    manualPropertiesString: '',
    baseObj: {},
}
export const DEFAULT_SETTINGS = {
    tagBaseFile: '',
    tagBaseSettings: [
        JSON.parse(JSON.stringify(DEFAULT_OBJ))
    ]
}


function addRootTag(containerEl, currentTag, app, plugin) {
    new Setting(containerEl)
        .setName('Root Tag')
        .setDesc('Root tag to apply these settings')
        .addSearch(search => {
            new TagSuggest(app, search.inputEl);
            search.setPlaceholder('Search for the root tag')
                .setValue(currentTag.tagname)
                .onChange(async (value) => {
                    currentTag.tagname = value;
                    await plugin.saveSettings();
                })
        });
}

function addView(containerEl, currentTag, plugin) {
    new Setting(containerEl)
        .setName('View Type')
        .setDesc('View Type of this tag category')
        .addDropdown(dropdown => dropdown
            .addOption('table', 'Table')
            .addOption('cards', 'Cards')
            .addOption('list', 'List')
            .setValue(currentTag.viewtype)
            .onChange(async (value) => {
                currentTag.viewtype = value;
                await plugin.saveSettings();
            }));
}
function parseYaml(value) {
    try {
        return parse(value, {strict: false, logLevel: 'error'})
    } catch(e) {
        console.log(e)
        new Notice(e)
    }
}

function addProperties(containerEl, currentTag, app, plugin) {
    const propertiesDescription = new DocumentFragment();
    const descriptionA = document.createElement("p");
    const descriptionB = document.createElement("p");
    const descriptionC = document.createElement("p");

    descriptionA.textContent = `Optionally override the
        generated query YAML. You may provide any
        section from view to sort.`
    descriptionB.textContent = `Missing top-level sections
        automatically fall back to the plugin defaults or
        UI settings. For example, if only sort is provided,
        the default view and filter will still be used.`
    descriptionC.textContent = `However, once a section is defined
        , it is followed exactly as written. If view is provided
        but filter is omitted, no filtering will be applied.`
    propertiesDescription.append(descriptionA, descriptionB, descriptionC)
    new Setting(containerEl)
        .setName("Manual Properties")
        .setDesc(propertiesDescription)
        .addTextArea(text => text
            .setPlaceholder("Provide custom Base code. Use (rootTag) to reference the current root tag.")
            .setValue(currentTag.manualPropertiesString)
            .onChange(async (value) => {
                const parsedYaml = parseYaml(value);
                if (typeof parsedYaml !== 'string') {
                    currentTag.baseObj = parsedYaml 
                }
                
                currentTag.manualPropertiesString = value;
                await plugin.saveSettings();
            }));
}

export class SettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    addTagSettings() {
        new Setting(this.containerEl)
            .setName("Tag Base Settings").setHeading()
            .setDesc("Tag Base Settings will allow you to edit particular tags");

        new Setting(this.containerEl)
            .setName("Set the tag base file")
            .setDesc("Set the tag base file. The tag base file should be empty\
            as it will be cleared everytime the tag is used.")
            .addSearch(search => search
                .setPlaceholder('The tag base file to use')
                .setValue(this.plugin.settings.tagBaseFile)
                .onChange(async (value) => {
                    
                })
            )

        this.plugin.settings.tagBaseSettings.forEach((tag, index) => {
            // todo
            // 1: HOOK PROCESS CODE
            // 2: ATTEMPT TO MAKE EACH TAG INTO ITS OWN TAB
            const currentTag = this.plugin.settings.tagBaseSettings[index];

            const currentTagName = currentTag.tagname === '' ? '(select a root tag)' : currentTag.tagname
            new Setting(this.containerEl)
                .setName(currentTagName).setHeading()
                .setDesc(`Settings for ${currentTagName}`)

            addRootTag(this.containerEl, currentTag, this.app, this.plugin);
            addView(this.containerEl, currentTag, this.plugin);
            addProperties(this.containerEl, currentTag, this.app, this.plugin);

            new Setting(this.containerEl).addButton((cb) => {
                cb.setButtonText("Delete this tag")
                    .setCta()
                    .onClick(async () => {
                        this.plugin.settings.tagBaseSettings.splice(index, 1);
                        await this.plugin.saveSettings();
                        // Force refresh
                        this.display();
                    });
            });
        })

        new Setting(this.containerEl).setHeading()

        new Setting(this.containerEl).addButton((cb) => {
            cb.setButtonText("Add new tag")
                .setCta()
                .onClick(async () => {
                    this.plugin.settings.tagBaseSettings.push(Object.assign({}, DEFAULT_OBJ));
                    await this.plugin.saveSettings();
                    // Force refresh
                    this.display();
                });
        });

    }

    display() {
        this.containerEl.empty();
        this.addTagSettings();
    }
}

class TagSuggest extends AbstractInputSuggest {
    constructor(app, inputEl) {
        super(app, inputEl);
        this.app = app;
        this.inputEl = inputEl;
    }

    getSuggestions(inputStr) {
        const lowerCaseInputStr = inputStr.toLocaleLowerCase();
        const tags = listTags(this.app);
        return [...tags].filter((e) => e.toLocaleLowerCase().contains(lowerCaseInputStr))
    }

    renderSuggestion(content, el) {
        el.setText(content);
    }

    selectSuggestion(value) {
        this.setValue(value);
        this.inputEl.trigger("input")
        this.close();
    }
}