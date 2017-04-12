'use babel';

import fs from 'fs';
import ComboverView from './combover-view';
import {
    CompositeDisposable
} from 'atom';

import Comb from 'csscomb';

console.log('Combover loaded');

export default {

    comboverView: null,
    modalPanel: null,
    subscriptions: null,
    projectRoot: atom.project.getPaths()[0],

    activate(state) {
        this.comboverView = new ComboverView(state.comboverViewState);
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.comboverView.getElement(),
            visible: false
        });

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'combover:combFile': () => this.combFile(),
            'combover:combProject': () => this.combProject()
        }));
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.comboverView.destroy();
    },

    serialize() {
        return {
            comboverViewState: this.comboverView.serialize()
        };
    },

    getConfig() {
        const configPath = `${this.projectRoot}/.csscomb.json`;
        let config;

        try {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch (e) {
            config = null;
        }

        return config;
    },

    combFile() {
        console.log(`combFile`);
        const path = atom.workspace.getActivePaneItem().buffer.file.path;
        // Ideally, this is updated to use a string as the input so as to
        // account for unsaved changes in the editor. By combing on a file path,
        // unsaved changes in the current editor window prevent the file from
        // being combed.

        // const text = atom.workspace.getActiveTextEditor().buffer.cachedText;
        const config = this.getConfig();
        const comb = new Comb(config);

        try {
            const filePromise = comb.lintFile(path)
                .then(res => {
                    console.log(res);
                    comb.processFile(path);
                })
                .catch(res => {
                    console.log('Oops, something went wrong.');
                    console.log(`Line ${res.line}`);
                    console.log(res.message);
                });
        } catch (res) {
            console.log(`Hmm, something is very wrong`);
            console.log(res);
        }
    },

    combProject() {
        console.log(`combProject`);
        const path = `${this.projectRoot}/brandweb/features`;
        const config = this.getConfig();
        const comb = new Comb(config);
        comb.processPath(path);
    }
};
