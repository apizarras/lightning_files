import React, { Component } from 'react';
import { Icon, IconSettings, Button, Card, Modal, DataTable, DataTableColumn, DataTableRowActions, Dropdown }  from '@salesforce/design-system-react';
import './FileView.scss';
import AddFileDialog from './AddFileDialog';
import queryString from 'query-string';
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
                embedded: (window.FX && window.FX.SALESFORCE && window.FX.SALESFORCE.embedded) || (queryString.parse(document.location.search).embedded && JSON.parse(queryString.parse(document.location.search).embedded)) || false,
            }
        }

    componentDidMount() {
      console.log("component Did Mount");
    }


    render() {
        return (
        <IconSettings iconPath="../../_slds/icons">
            <div className="slds-grid slds-grid_vertical component-container">
              <Card
                  icon={<Icon category="standard" name="document" size="medium" />}
                  headerActions={<button type="button" className="slds-button slds-button_neutral" onClick={this.toggleOpen}>Upload File</button>}
              >
                  <Modal heading="Upload File" isOpen={this.state.isOpen} ariaHideApp={false} disableClose>
                  </Modal>
                  <div className="data-table">
                    <DataTable fixedHeader fixedLayout items={this.state.files}>
                      <DataTableColumn label="Sync" property="sync" width="20%">
                        <CustomDataTableCell />
                      </DataTableColumn>
                      <DataTableColumn label="Title" property="title" />
                      <DataTableColumn label="Created By" property="createdBy" />
                      <DataTableColumn label="Last Modified Date" property="lastModifiedDate" />
                      <DataTableRowActions
                      dropdown={<Dropdown iconCategory="utility"
                        iconName="down"
                        options={[
                          {label: "Download"},
                          {label: "Preview"},
                          {label: "Delete"}
                          ]}/>} />
                    </DataTable>
                  </div>
              </Card>
            </div>
        </IconSettings>
        )
    }
}

export default FileView;