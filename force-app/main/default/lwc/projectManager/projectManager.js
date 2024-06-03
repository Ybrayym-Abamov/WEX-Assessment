import { LightningElement,api, track,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; 
import getProjects from '@salesforce/apex/ProjectManagerController.getProjects';
import deleteProject from '@salesforce/apex/ProjectManagerController.deleteProject';

export default class ProjectManager extends LightningElement {

    @api recordId;
    @track currentProjectRecord;
    @track currentProjectId;
    @track projectId;
    @track projectObj = {};
    @track milestones = [];
    @track todoItems = [];
    @track isLoading=false;
    @track isShowMilestoneSection=false;

    handleToggleSection(){}

    @track isShowModal = false;
    @track isShowProjectModal=false;

    showModalBox() {  
        this.isShowModal = true;
    }

    hideModalBox() {  
        this.isShowModal = false;
    } 

    showProjectModal(){
        this.isShowProjectModal=true;
    }
    hideProjectModal(){
        this.isShowProjectModal=false;
    }

    handleSuccess(event) {
        this.isLoading=true;
        this.showNotification('Project has beed created successfully.','success','Success');   
        this.isShowProjectModal=false; 
        this.loadProjectList();
    }

    connectedCallback() {
       this.loadProjectList()
    }

    loadProjectList(){
        getProjects({})
        .then(result => {
            this.projectList = result.map(row => {
                let actionUrl = `/${row.Id}`;
                let CreatedBy = row.CreatedBy.Name;
                let ProjectOwner = row.Project_Owner__r;
                if(ProjectOwner!=undefined){
                    ProjectOwner=ProjectOwner.Name;
                }
                return { ...row, actionUrl,CreatedBy,ProjectOwner}
            })
            this.isLoading=false;
        })    
        .catch(error => {
            this.isLoading=false;
        });
    }

    showNotification(message,variant,title) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
   



    @track columns = [
        {
            label: 'Name',
            fieldName: 'actionUrl',
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Name' },
                target: '_blank'
            }
        },
        { label: 'Project Owner', fieldName: 'ProjectOwner'},
        { label: '% Complete', fieldName: 'Percentage_Complete__c'},
        { label: 'Status__c', fieldName: 'Status__c'},
        { label: 'Milestones Count', fieldName: 'Total_Milestones__c'},
        { label: 'Total Milestones % Complete', fieldName: 'Total_Milestones_Percent_Complete__c'},
        { label: 'Created By', fieldName: 'CreatedBy'},
        { label: 'Created Date', fieldName: 'CreatedDate',type: 'date',
            typeAttributes: {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
            }
        },
        {
            type: "button", label: 'Milestone', typeAttributes: {
                label: 'Milestone',
                name: 'milestone',
                title: 'Show Milestone',
                disabled: false,
                value: 'milestone',
                iconPosition: 'left',
                iconName: 'utility:summarydetail'
            }
        },
        {
            type: "button", label: 'Delete', typeAttributes: {
                name: 'delete',
                title: 'Delete',
                disabled: false,
                value: 'delete',
                iconPosition: 'left',
                iconName: 'utility:delete'
            }
        }

    ];
     @track projectList;
    /*
     @wire (getProjects) wiredProjects({data,error}){ 
        if (data) {
            this.projectList = data.map(row => {
                let actionUrl = `/${row.Id}`;
                let CreatedBy = row.CreatedBy.Name;
                let ProjectOwner = row.Project_Owner__r;
                if(ProjectOwner!=undefined){
                    ProjectOwner=ProjectOwner.Name;
                }
                return { ...row, actionUrl,CreatedBy,ProjectOwner}
            })
            //this.projectList = data;
            //console.log(JSON.stringify(data)); 
        } else if (error) {
            console.log(error);
        }
    }*/

    handleRowAction(event) {
        this.isShowMilestoneSection=false;
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'milestone':
                this.currentProjectRecord=row; 
                this.currentProjectId=row.Id;
                this.isShowMilestoneSection = true;
                break;
            case 'delete':
                this.isLoading=true;
                deleteProject({projectId:row.Id})
                .then(result => {
                    this.loadProjectList();
                })    
                .catch(error => {
                    this.isLoading=false;
                    this.showNotification('Error while deleting project.','error','Failure');
                    console.log(error);
                });                
                break;
            default:
        }        
    }


}