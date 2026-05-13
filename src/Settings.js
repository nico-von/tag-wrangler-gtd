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
            const currentTag = this.plugin.settings.tagBaseSettings[index];

            const currentTagName = currentTag.tagname === '' ? '(select a root tag)' : currentTag.tagname
            new Setting(this.containerEl)
                .setName(currentTagName).setHeading()
                .setDesc(`Settings for ${currentTagName}`)

            new Setting(this.containerEl)
                .setName('Root Tag')
                .setDesc('Root tag to apply these settings')
                .addSearch(search => {
                    new TagSuggest(this.app, search.inputEl);
                    search.setPlaceholder('Search for the root tag')
                        .setValue(currentTag.tagname)
                        .onChange(async (value) => {
                            currentTag.tagname = value;
                            await this.plugin.saveSettings();
                        })
                });

            new Setting(this.containerEl)
                .setName('View Type')
                .setDesc('View Type of this tag category')
                .addDropdown(dropdown => dropdown
                    .addOption('table', 'Table')
                    .addOption('cards', 'Cards')
                    .addOption('list', 'List')
                    .setValue(currentTag.viewtype)
                    .onChange(async (value) => {
                        currentTag.viewtype = value;
                        await this.plugin.saveSettings();
                    }));

            new Setting(this.containerEl)
            .setName("Additional Property Settings").setHeading()
            .setDesc("Additional Properties to show")

            new Setting(this.containerEl)    
                .addSearch(search => search
                    .setPlaceholder('Select or type a property or formula')
                    .onChange(async (value) => {
                    }));

             new Setting(this.containerEl).addButton((cb) => {
                cb.setButtonText("Add new property")
                    .setCta()
                    .onClick(async () => {
                        // Force refresh
                        this.display();
                    });
            });
            
            new Setting(this.containerEl)
            .setName("Additional Group Settings").setHeading()
            .setDesc("Additional Group Settings to apply")

            new Setting(this.containerEl)
                .addSearch(search => search
                    .setPlaceholder('Select or type the property to group')
                    .onChange(async (value) => {
                    }));
            
            new Setting(this.containerEl)
                .addSearch(text => text
                    .setPlaceholder('Type direction of this group')
                    .onChange(async (value) => {
                    }));
            

            new Setting(this.containerEl).addButton((cb) => {
                cb.setButtonText("Add new group setting")
                    .setCta()
                    .onClick(async () => {
                        // Force refresh
                        this.display();
                    });
            });
            
            new Setting(this.containerEl)
            .setName("Additional Sort Settings").setHeading()
            .setDesc("Additional Sort Settings to apply")

            new Setting(this.containerEl)
                .addSearch(search => search
                    .setPlaceholder('Select or type the property to sort')
                    .onChange(async (value) => {

                    })
                )
            new Setting(this.containerEl)
                .addText(text => text
                    .setPlaceholder('Type the direction of this sort')
                    .onChange(async (value) => {
                    }));
            
            new Setting(this.containerEl).addButton((cb) => {
                cb.setButtonText("Add new sort setting")
                    .setCta()
                    .onClick(async () => {
                        // Force refresh
                        this.display();
                    });
            });

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