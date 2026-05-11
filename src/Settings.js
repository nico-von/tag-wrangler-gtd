import { PluginSettingTab, Setting } from "obsidian";

export const DEFAULT_SETTINGS = {
    tagSettings: [
        {
            test1: 'default',
            test2: 'default',
            test3: 'default'
        }
    ]
}

export class SettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        const { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Root Tag')
            .setDesc('Root tag to apply these settings')
            .addText(text => text
                .setPlaceholder('Enter the root tag')
                .setValue(this.plugin.settings.test1)
                .onChange(async (value) => {
                    this.plugin.settings.test1 = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('View Type')
            .setDesc('View Type of this tag category')
            .addDropdown(dropdown => dropdown
                .addOption('table', 'Table')
                .addOption('cards', 'Cards')
                .addOption('list', 'List')

                .setValue(this.plugin.settings.test2)
                .onChange(async (value) => {
                    this.plugin.settings.test2 = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Additional Base Settings')
            .setDesc('Additional Base Code to put after \`filter\` to this tag category')
            .addText(text => text
                .setPlaceholder('order...')
                .setValue(this.plugin.settings.test3)
                .onChange(async (value) => {
                    this.plugin.settings.test3 = value;
                    await this.plugin.saveSettings();
                }));
    }
}