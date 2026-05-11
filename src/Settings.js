import { PluginSettingTab, Setting } from "obsidian";

const DEFAULT_OBJ = {
    tagname: 'default',
    viewtype: 'table',
    addProperties: 'default'
}
export const DEFAULT_SETTINGS = {
    tagBaseSettings: [
        DEFAULT_OBJ
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

        this.plugin.settings.tagBaseSettings.forEach((tag, index) => {
            const currentTag = this.plugin.settings.tagBaseSettings[index];

            new Setting(this.containerEl)
            .setName(currentTag.tagname).setHeading()
            .setDesc(`Settings for ${currentTag.tagname}`);

            new Setting(this.containerEl)
                .setName('Root Tag')
                .setDesc('Root tag to apply these settings')
                .addText(text => text
                    .setPlaceholder('Enter the root tag')
                    .setValue(currentTag.tagname)
                    .onChange(async (value) => {
                        currentTag.tagname = value;
                        await this.plugin.saveSettings();
                    }));

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
                .setName('Additional Base Settings')
                .setDesc('Additional Base Code to put after filter to this tag category')
                .addTextArea(text => text
                    .setPlaceholder('order...')
                    .setValue(currentTag.addProperties)
                    .onChange(async (value) => {
                        currentTag.addProperties = value;
                        await this.plugin.saveSettings();
                    }));

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

        new Setting(this.containerEl).addButton((cb) => {
            cb.setButtonText("Add new tag")
                .setCta()
                .onClick(async () => {
                    this.plugin.settings.tagBaseSettings.push(DEFAULT_OBJ);
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