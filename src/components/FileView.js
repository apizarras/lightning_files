import React, { Component } from 'react';
import { Icon, IconSettings, Button, Card, Modal, DataTable, DataTableColumn, DataTableRowActions, Dropdown }  from '@salesforce/design-system-react';
import './FileView.scss';
// import AddFileDialog from './AddFileDialog';
import queryString from 'query-string';
import moment from 'moment';
// import CustomDataTableCell from './CustomDataTableCell';
import { ComponentContext } from './Context/context';


class FileView extends Component {
  static contextType = ComponentContext;
  sObjectId = null;

  constructor(props) {
        super(props);
            this.state = {
                selection: [],
                isOpen: false,
                files: [],
                fileCount: null,
                parentId: null,
                sessionExpired: false,
                isBusy: true,
                isDirty: false,
                fileToDelete: [],
                showDeletePrompt: false,
            }
        }

    componentDidMount() {
      this.fetchData();
    }

    toggleOpen = () => {
        this.setState({isOpen: true});
    };

    toggleClose = () => {
        this.setState({isOpen: false});
    }

    countFiles =(fileCount) => {
      this.setState({fileCount: this.state.files.length});
    }

    handleSelectionAction = (e, value) => {
      console.log("this.state: ", this.state);
      const newValue = value.label;
      switch (newValue) {
        case "Delete":
          this.promptFileDelete(e.id);
          break;
        case "Preview":
          this.previewFile(e.id);
          break;
        case "Download":
          this.downloadFile(e.id);
          break;
      }
    }

    promptFileDelete = (fileInfo) => {
      const selection = this.state.selection
      selection.push(fileInfo);
      this.setState({fileToDelete: selection, showDeletePrompt: true});
    }

    handleFileDelete = (fileToDelete) => {
      const id = this.state.fileToDelete;
      const { api } = this.context;
      return api
      .deleteItems(id)
      .then(response => {
        this.setState({fileToDelete: []});
        this.setState({showDeletePrompt: false});
        this.setState({selection: []});
      })
      .then(this.fetchData)
      .catch(error => {
        console.error(error);
      })
    }

    previewFile = (id) => {
      const { api } = this.context;
      console.log("context: ", this.context);
      const newUrl = this.context.settings.instanceUrl + `/lightning/r/ContentDocument/` + id + `/view`;
      const win = window.open(newUrl, '_blank');
    }

    downloadFile = (e) => {
      const { api } = this.context;
      return api.downloadFile(e);
    }

    fetchData = () => {
        this.data =
        {
          sObjectId: this.context.settings.recordId,
          sobject: this.context.settings.sobject
        };
        const { api } = this.context;
        console.log("contextTypen: ", this.context);
        console.log("this.data: ", this.data);
        const parentId = this.data.sObjectId;
        const sObjectId = parentId;
        const sobject = 'ContentDocument';
        const descriptions = {};
        this.setState({
          isBusy: true
        });
        api
          .fetchFiles(sObjectId)
          .then(files => {
            console.log("files response from fetchFiles: ", files);
            const fileDetails = files.map(detail => {
              return {
                id: detail.ContentDocument.Id,
                LatestPublishedVersionId: detail.ContentDocument.LatestPublishedVersion.Id,
                title: detail.ContentDocument.LatestPublishedVersion.Title,
                createdBy: detail.ContentDocument.LatestPublishedVersion.CreatedBy.Name,
                lastModifiedDate: moment.utc(detail.ContentDocument.LatestPublishedVersion.LastModifiedDate).local().format('L LT'),
                lastModifiedBy: detail.ContentDocument.LatestPublishedVersion.LastModifiedBy.Name,
                sync: detail.ContentDocument.LatestPublishedVersion.FX5__Sync__c,
                url: detail.ContentDocument.attributes.url
              }
            });
            this.setState({ files: fileDetails, isBusy: false });
            console.log("this.state.files: ", this.state.files);
            this.countFiles(files);
            })
          .catch(function(err) {
            if (err.errorCode === 'INVALID_SESSION_ID') {
              this.setState({ sessionExpired: true, isBusy: false });
            }
            console.log(`%c>>>> ERROR `, `background-color: red; color:yellow;` , err );
          })
      };

      handleCheckboxChange = (Id, checkboxValue, [items], file, index) => {
        console.log("this.context: ", this.context);
        const { api } = this.context;
        this.setState({updatingIndex: index});
        console.log("index: ", index);
        const files = this.state.files;
        console.log("file", file);
         console.log("this.state", this.state);
        return api.toggleSyncFlag(file)
          .then(result => {
            this.fetchData();
            this.setState({files: [...files], updatingIndex: null});
          })
      }

    render() {
        return (
        <IconSettings iconPath="../../_slds/icons">
            <div className="slds-grid slds-grid_vertical component-container">
              <Card
                  heading={this.state.fileCount > 1 && <strong>Files {(`(${this.state.fileCount})`)}</strong> || this.state.fileCount === 1 && <strong>File {(`(${this.state.fileCount})`)}</strong> }
                  icon={<Icon category="standard" name="document" size="medium" />}
                  headerActions={<button type="button" className="slds-button slds-button_neutral" onClick={this.toggleOpen}>Upload File</button>}
              >
                  <Modal heading="Upload File" isOpen={this.state.isOpen} ariaHideApp={false} disableClose>
                      {/* <AddFileDialog
                          onSave={this.fetchData}
                          connection={this.props.connection}
                          parentId={this.state.sObjectId}
                          handleClose={this.toggleClose}
                          files={this.state.files}
                          dataService={this.context}
                          /> */}
                  </Modal>
                  <div className="data-table">
                    <DataTable fixedHeader fixedLayout items={this.state.files}>
                      <DataTableColumn label="Sync" property="sync" width="20%">
                        {/* <CustomDataTableCell handleCheckboxChange={this.handleCheckboxChange}/> */}
                      </DataTableColumn>
                      <DataTableColumn label="Title" property="title" />
                      <DataTableColumn label="Created By" property="createdBy" />
                      <DataTableColumn label="Last Modified Date" property="lastModifiedDate" />
                      <DataTableRowActions
                      onAction={this.handleSelectionAction}
                      dropdown={<Dropdown iconCategory="utility"
                        iconName="down"
                        options={[
                          {label: "Download"},
                          {label: "Preview"},
                          {label: "Delete"}
                          ]}/>} />
                    </DataTable>
                  </div>
                  <Modal heading="Delete File?" isOpen={this.state.showDeletePrompt} ariaHideApp={false} disableClose
                  footer={[
                    <Button label="Cancel" onClick={() => this.setState({showDeletePrompt: false})} />,
                    <Button label="Delete" variant="brand" onClick={this.handleFileDelete} />,
                  ]}>
                          <p className="slds-m-around_medium">Deleting a file also removes it from any records or posts it's attached to.</p>
                  </Modal>
              </Card>
            </div>
        </IconSettings>
        )
    }
}

export default FileView;