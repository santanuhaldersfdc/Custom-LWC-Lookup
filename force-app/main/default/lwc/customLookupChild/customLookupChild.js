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
    timeOutVar;
    selectedId;
    selectedName;
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
    get inputDivClass() {
        return this.optionSelected ?
            'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_left-right' :
            'slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right';
    }
    get searchResultDivClass() {
        return this.showResults ?
            'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' :
            'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
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
    get optionSelected() {
        return this.selectedId != undefined && this.selectedId != '' && this.selectedId != null;
    }
    connectedCallback() {
        this.__mouseUpListener = this.mouseUpListener.bind(this);
        window.addEventListener('click', this.__mouseUpListener);
        this.showResults = false;
        this.fetchResults();
    }
    mouseUpListener() {
        console.log('logged in func');
        if (this.timeOutVar) {
            clearTimeout(this.timeOutVar);
        }
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
        let selectedName = e.currentTarget.getAttribute('data-var');
        
        this.selectedId = selectedId;
        this.selectedName = selectedName;

        let evt = new CustomEvent('lookupvalueselected', {
            detail: {
                'selectedId': selectedId
            }
        });
        this.dispatchEvent(evt);
        this.showResults = false;
    }
    removeSelection(e)
    {
        e.preventDefault();
        e.stopPropagation();
        this.selectedId = null;
        let evt = new CustomEvent('lookupvalueselected', {
            detail: {
                'selectedId': null
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
    handleSearchTermChange(e) {
        let searchTerm = e.target.value;
        console.log('mouseup' + searchTerm);
        this.searchTerm = searchTerm;
        if (this.timeOutVar) {
            clearTimeout(this.timeOutVar);
        }
        this.__fetchResults = this.fetchResults.bind(this);
        this.timeOutVar = setTimeout(
            this.__fetchResults, 300);
    }
    fetchResults() {
        console.log('fetch called');
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
        } else if (this.searchTerm.length > 1) {
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

}