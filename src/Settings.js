import { PluginSettingTab, Setting, AbstractInputSuggest } from "obsidian";
import { listTags } from "./plugin";

const DEFAULT_OBJ = {
    tagname: '',
    viewtype: 'table',
    orderproperties: [], 
    groupproperties: [], //{property: '', direction: ''}
    sortproperties: [], //{property: '', direction: ''}
}
export const DEFAULT_SETTINGS = {
    tagBaseFile: '',
    tagBaseSettings: [
        Object.assign({}, DEFAULT_OBJ)
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

function addProperties(containerEl, currentTag, app, plugin) {
    new Setting(containerEl)
        .setName("Additional Property Settings").setHeading()
        .setDesc("Additional Properties to show")

    new Setting(containerEl)
        .addSearch(search => search
            .setPlaceholder('Select or type a property or formula')
            .onChange(async (value) => {
            }));

    new Setting(containerEl).addButton((cb) => {
        cb.setButtonText("Add new property")
            .setCta()
            .onClick(async () => {
                // Force refresh
                this.display();
            });
    });

}

function addGroupSettings(containerEl, currentTag, app, plugin) {
    new Setting(containerEl)
        .setName("Additional Group Settings").setHeading()
        .setDesc("Additional Group Settings to apply")

    new Setting(containerEl)
        .addSearch(search => search
            .setPlaceholder('Select or type the property to group')
            .onChange(async (value) => {
            }));

    new Setting(containerEl)
        .addSearch(text => text
            .setPlaceholder('Type direction of this group')
            .onChange(async (value) => {
            }));


    new Setting(containerEl).addButton((cb) => {
        cb.setButtonText("Add new group setting")
            .setCta()
            .onClick(async () => {
                // Force refresh
                this.display();
            });
    });
}

function addSortSettings(containerEl, currentTag, app, plugin) {
    new Setting(containerEl)
        .setName("Additional Sort Settings").setHeading()
        .setDesc("Additional Sort Settings to apply")

    new Setting(containerEl)
        .addSearch(search => search
            .setPlaceholder('Select or type the property to sort')
            .onChange(async (value) => {

            })
        )
    new Setting(containerEl)
        .addText(text => text
            .setPlaceholder('Type the direction of this sort')
            .onChange(async (value) => {
            }));

    new Setting(containerEl).addButton((cb) => {
        cb.setButtonText("Add new sort setting")
            .setCta()
            .onClick(async () => {
                // Force refresh
                this.display();
            });
    });
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
            addGroupSettings(this.containerEl, currentTag, this.app, this.plugin);
            addSortSettings(this.containerEl, currentTag, this.app, this.plugin);

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