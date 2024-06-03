import { LightningElement,api, track,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMilestones from '@salesforce/apex/ProjectManagerController.getMilestones';
import loadMilestoneList from '@salesforce/apex/ProjectManagerController.loadMilestoneList';
import deleteMilestone from '@salesforce/apex/ProjectManagerController.deleteMilestone';

export default class MilestoneComponent extends LightningElement {
    @api projectRecord;
    @api projectId;
    @track cardTitle='Milestone';
    @track isShowMilestoneModal=false;
    @track isShowTaskModal=false;
    @track milestonetList;
    @track isLoading=false;
    @track milestoneId;

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
        { label: 'Due Date', fieldName: 'Due_Date__c'},
        { label: '% Complete', fieldName: 'Percentage_Complete__c'},
        { label: 'Status__c', fieldName: 'Status__c'},
        { label: 'Total Milestone Task', fieldName: 'Total_Milestone_Todos__c'},
        { label: 'Completed Milestone Task', fieldName: 'Total_Complete_Milestone_Todos__c'},
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
            type: "button", label: 'Detail', typeAttributes: {
                label: 'Detail',
                name: 'detail',
                title: 'Detail',
                disabled: false,
                value: 'detail',
                iconPosition: 'left',
                iconName: 'utility:summarydetail'
            }
        }

    ];


    connectedCallback() {
        this.cardTitle = 'Milestone : Peoject#'+this.projectRecord.Name;
    }

    refreshSection(){
        this.loadMilestoneList();    
    }

    loadMilestoneList(){
        this.isLoading=true;
        loadMilestoneList({projectId:this.projectId})
        .then(result => {
            this.milestonetList = result.map(row => {
                let actionUrl = `/${row.Id}`;
                let CreatedBy = row.CreatedBy.Name;
                let acrodianName = row.Name + ' (Task Count ' + row.Total_Milestone_Todos__c + ')';
                return { ...row, actionUrl,CreatedBy,acrodianName}
            })
            this.isLoading=false;
        })    
        .catch(error => {
            this.isLoading=false;
            console.log(error);
        });

    }

    showMilestoneModal(){
        this.isShowMilestoneModal=true;
    }
    hideMilestoneModal(){
        this.isShowMilestoneModal=false;
    }

    showTaskModal(event){
        this.isShowTaskModal=true;
        this.milestoneId=event.target.dataset.milestoneId;
    }
    hideTaskModal(){
        this.isShowTaskModal=false;
        this.milestoneId=undefined;
    }


    handleMilestoneSuccess(event) {
        this.isLoading=true;
        this.showNotification('Milestone has beed created successfully.','success','Success');   
        this.isShowMilestoneModal=false; 
        this.loadMilestoneList();
    }

    handleTaskSuccess(event) {
        this.isLoading=true;
        this.showNotification('Task has beed created successfully.','success','Success');   
        this.isShowTaskModal=false;
        this.milestoneId=undefined; 
        this.loadMilestoneList();
    }


    showNotification(message,variant,title) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }

    handleDeleteMilestone(event){
        var milestoneId = event.target.dataset.milestoneId;
         this.isLoading=true;
        deleteMilestone({milestoneId:milestoneId})
        .then(result => {
            this.loadMilestoneList();
        })    
        .catch(error => {
            this.isLoading=false;
            this.showNotification('Error while deleting milestone.','error','Failure');
            console.log(error);
        });

    }

     @wire (getMilestones,{ projectId: '$projectId' }) wiredProjects({data,error}){ 
        if (data) {
            this.milestonetList = data.map(row => {
                let actionUrl = `/${row.Id}`;
                let CreatedBy = row.CreatedBy.Name;
                let acrodianName = row.Name + ' (Task Count ' + row.Total_Milestone_Todos__c + ')';
                return { ...row, actionUrl,CreatedBy,acrodianName}
            })
            this.cardTitle = 'Milestone : Peoject#'+this.projectRecord.Name;
            //this.projectList = data;
            console.log('Milestone Data : '+JSON.stringify(data)); 
        } else if (error) {
            console.log(error);
        }
     }



}