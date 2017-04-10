'use babel';

import fs from 'fs';
import ComboverView from './combover-view';
import {
    CompositeDisposable
} from 'atom';

import Comb from 'csscomb';
// import * as config from './'

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
            'combover:toggle': () => this.toggle(),
            'combover:comb': () => this.comb()
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

    toggle() {
        return (
            this.modalPanel.isVisible() ?
            this.modalPanel.hide() :
            this.modalPanel.show()
        );
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

    comb() {
        console.log(`Let's get combing!`);
        const path = atom.workspace.getActivePaneItem().buffer.file.path;
        const config = this.getConfig();
        const comb = new Comb(config);
        comb.processPath(path);
    }
};
