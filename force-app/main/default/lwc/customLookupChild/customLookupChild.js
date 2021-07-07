import { api, LightningElement } from 'lwc';
import search from '@salesforce/apex/CustomLookupController.search';
import fetch from '@salesforce/apex/CustomLookupController.fetch';
/**
 * This component is reusable to show any type of lookup wih filters
 */
export default class CustomLookup extends LightningElement {
    @api objectName;
    @api whereClause;
    @api mainFieldToShow;
    @api addnFieldToShow;
    @api numberOfResults;
    @api iconName;

    searchTerm;
    results;
    showResults;
    /**
     * formats the results into a generic list 
     * with parameters like mainfieldtoshow and addnfieldtoshow
     */
    get resultsToShow() {

        let resultsLocal = this.results.map(item => {
            item.mainFieldToShow = item[this.mainFieldToShow];
            item.addnFieldToShow = item[this.addnFieldToShow];
            return item;
        });
        return resultsLocal;
    }
    get isResultsAvailable() {
        if (this.results && this.results.length > 0) {
            return true;
        }
        return false;
    }
    get searchResultDivClass() {
        return this.showResults ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    }
    get formattedQuery() {
        if (this.searchTerm == undefined) {
            this.searchTerm = '';
        }
        if (this.searchTerm == '') {
            return 'SELECT Id,' + this.mainFieldToShow + ',' + this.addnFieldToShow + ' from ' + this.objectName + ' where ' + this.whereClause + ' limit ' + this.numberOfResults;
        } else {
            return 'FIND \'' + this.searchTerm + '\' IN ALL FIELDS RETURNING ' + this.objectName + '(Id,' + this.mainFieldToShow + ',' + this.addnFieldToShow + ' WHERE ' + this.whereClause + ')';
        }
    }

    connectedCallback() {
        this.__mouseUpListener = this.mouseUpListener.bind(this);
        window.addEventListener('click', this.__mouseUpListener);
        this.showResults = false;
        if (this.searchTerm == '' || this.searchTerm == undefined) {
            fetch({ 'query': this.formattedQuery, 'objectName': this.objectName })
                .then(result => {
                    console.log(result);
                    let resultVar = JSON.parse(result);
                    this.results = resultVar.returnValue.searchResults;
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            search({ 'query': this.formattedQuery, 'objectName': this.objectName })
                .then(result => {
                    console.log(result);
                    let resultVar = JSON.parse(result);
                    this.results = resultVar.returnValue.searchResults;
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }
    mouseUpListener() {
            console.log('logged in func');
            this.showResults = false;
        }
        /**
         * 
         * @param {event} e 
         * selects the record
         * passes the selected record to parent
         * closes the results
         */
    handleSelection(e) {
        e.preventDefault();
        e.stopPropagation();
        let selectedId = e.currentTarget.getAttribute('data-id');
        console.log(selectedId);

        let evt = new CustomEvent('lookupvalueselected', {
            detail: {
                'selectedId': selectedId
            }
        });
        this.dispatchEvent(evt);
        this.showResults = false;
    }
    handleClickOnInput(e) {
        e.preventDefault();
        e.stopPropagation();
        this.showResults = true;
    }

}