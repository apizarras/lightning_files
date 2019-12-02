import React, { Component } from 'react';
import { Icon, Button, Card, Modal, DataTable, DataTableColumn, DataTableRowActions, Dropdown }  from '@salesforce/design-system-react';
import './FileView.scss';
import AddFileDialog from './AddFileDialog';
import moment from 'moment';
import CustomDataTableCell from './CustomDataTableCell';
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
        default:
      }
    }

    promptFileDelete = (fileInfo) => {
      const selection = this.state.selection
      selection.push(fileInfo);
      this.setState({fileToDelete: selection, showDeletePrompt: true});
    }

    handleFileDelete = () => {
      const ids = this.state.fileToDelete;
      const { api } = this.context;
      return api
      .deleteItems('ContentDocument', ids)
      .then(response => {
        this.setState({fileToDelete: []});
        this.setState({showDeletePrompt: false});
        this.setState({selection: []});
      })
      .then(this.fetchData)
      .catch(error => {
        console.log(error);
      })
    };

    previewFile = (id) => {
      const { api } = this.context;
      return api.previewFile(id)
      .then(response => {
        const win = window.open(response, '_blank');
      })
      .catch(error => {
        console.log(error);
      })
    };

    downloadFile = (id) => {
      const { api } = this.context;
      return api.downloadFile(id)
      .then(
        response => {
          const link = document.createElement("a");
          link.href = response;
          link.setAttribute("download", id);
          link.click();
        }
      )
      .catch(error => {
        console.log(error);
      })
    };

    fetchData = () => {
        this.data =
        {
          sObjectId: this.context.settings.recordId,
          sobject: this.context.settings.sobject
        };
        const { api } = this.context;
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
            const fileDetails = files.map(detail => {
              return {
                id: detail.ContentDocument.Id,
                LatestPublishedVersionId: detail.ContentDocument.LatestPublishedVersion.Id,
                title: detail.ContentDocument.LatestPublishedVersion.Title,
                createdBy: detail.ContentDocument.CreatedBy.Name,
                lastModifiedDate: moment.utc(detail.ContentDocument.LatestPublishedVersion.LastModifiedDate).local().format('L LT'),
                lastModifiedBy: detail.ContentDocument.LatestPublishedVersion.LastModifiedBy.Name,
                sync: detail.ContentDocument.LatestPublishedVersion.FX5__Sync__c,
              }
            });
            this.setState({ files: fileDetails, isBusy: false });
            this.countFiles(files);
            })
          .catch(function(err) {
            if (err.errorCode === 'INVALID_SESSION_ID') {
              this.setState({ sessionExpired: true, isBusy: false });
            }
            console.log(`%c>>>> ERROR `, `background-color: red; color:yellow;` , err );
          })
      };

      handleCheckboxChange = (Id, checkboxValue, [items], file) => {
        const { api } = this.context;
        const files = this.state.files;
        const fileId = file.LatestPublishedVersionId;
        const sobjectType = 'ContentVersion';
        const columnName = 'FX5__Sync__c';
        const changes = [{Id: fileId, [columnName]: !file.sync}];
        return api.updateItems(sobjectType, changes)
        .then(result => {
          this.fetchData();
          this.setState({files: [...files], updatingIndex: null});
        })
        .catch(error => {
          console.log(error);
        })
      };


    render() {
        return (
            <div className="slds-grid slds-grid_vertical component-container">
              <Card
                  heading={this.state.fileCount > 1 && <strong>Files {(`(${this.state.fileCount})`)}</strong> || this.state.fileCount === 1 && <strong>File {(`(${this.state.fileCount})`)}</strong> }
                  icon={<Icon category="standard" name="document" size="medium" />}
                  headerActions={<button type="button" className="slds-button slds-button_neutral" onClick={this.toggleOpen}>Upload File</button>}
              >
                      <AddFileDialog
                          onSave={this.fetchData}
                          isOpen={this.state.isOpen}
                          parentId={this.state.sObjectId}
                          handleClose={this.toggleClose}
                          files={this.state.files}
                          dataService={this.context}
                          />
                  <div className="data-table">
                    <DataTable items={this.state.files} fixedHeader fixedLayout className="slds-p-left_small slds-p-right_small">
                      <DataTableColumn label="Sync" property="sync" width="5rem">
                        <CustomDataTableCell handleCheckboxChange={this.handleCheckboxChange}/>
                      </DataTableColumn>
                      <DataTableColumn label="Title" property="title" />
                      <DataTableColumn label="Created By" property="createdBy" />
                      <DataTableColumn label="Last Modified Date" property="lastModifiedDate" />
                      <DataTableRowActions
                      onAction={this.handleSelectionAction}
                      fileName={this.Title}
                      instanceUrl={this.context.settings.instanceUrl}
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
        )
    }
}

export default FileView;