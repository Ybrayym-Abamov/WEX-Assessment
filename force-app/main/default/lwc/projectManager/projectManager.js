import { LightningElement,api, track } from 'lwc';
export default class ProjectManager extends LightningElement {

    @api recordId;

    @track projectObj = {};
    @track milestones = [];
    @track todoItems = [];

    handleToggleSection(){}


}