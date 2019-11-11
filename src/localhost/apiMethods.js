import { CONTENTDOCUMENTLINK_FIELDS } from '../constants';
import axios from 'axios';

const createDataService = connection => {
  let acls = {};
  const descriptions = {};
  const hasPermission = (permission) => {
    return acls[permission]
  };

return {
  describe: sobject => connection.describe(sobject),
  describeFields: sobject =>
    connection.describe(sobject).then(description =>
      description.fields.reduce((fields, field) => {
        fields[field.name] = field;
        return fields;
      }, {})
    ),
  describeChildRelationships: sobject =>
    connection.describe(sobject).then(description => description.childRelationships),
  describePicklist: (sobject, fieldName) =>
    connection.describe(sobject).then(description => {
      return description.fields.find(f => f.name === fieldName).picklistValues;
    }),
  query: soql => connection.query(soql).then(r => r.records),
  queryCount: soql => connection.query(soql).then(r => r.totalSize),
  getUser: () => {
    const r = connection.identity;
    return Promise.resolve({
      ...r,
      id: r.user_id,
      orgId: r.organization_id,
      userType: r.user_type,
      isMultiCurrency: true,
      defaultCurrency: 'USD'
    });
  },
  updateItems: (connection, sobjectType, changes) => {
    console.log("connection", connection);
    return connection
      .sobject(sobjectType)
      .update(changes, { allOrNone: false })
      .then(results => {
        return {
          updatedRecords: results.map(r => r.id),
          errors: results
            .filter(r => !r.success)
            .map(r => {
              return { id: r.id, message: r.errors.map(e => e.message).join(' ') };
            })
        };
      });
  },
  deleteItems: (ids) => {
    console.log("ids", ids);
    return connection
      .sobject("ContentDocument")
      .destroy(ids)
      .then(results => {
        const values = ids.map((id, index) => {
          return {
            id,
            success: results[index].success,
            message: results[index].errors.map(e => e.message).join(' ')
          };
        });
        return {
          deletedRecords: values.filter(r => r.success).map(r => r.id),
          errors: values.filter(r => !r.success)
        };
      })
      .catch(error => {
        console.log("error: ", error)
      })
  },
  fetchFiles: (sobjectId, embedded) => {
    let sortOpts = ['ContentDocument.LatestPublishedVersion.SystemModStamp DESC', 'SystemModStamp DESC'];
    console.log("contentDocument fields", CONTENTDOCUMENTLINK_FIELDS);
    console.log("connection: ", connection);
    console.log("sObjectId: ", sobjectId);
    if (embedded) {
      // sort by FX5__Sync__c first, so synced files show first in compact view
      sortOpts.splice(0,0,'ContentDocument.LatestPublishedVersion.FX5__Sync__c DESC');
    }
    return connection
      .sobject('ContentDocumentLink')
      .select(CONTENTDOCUMENTLINK_FIELDS.join(', '))
      .where(`LinkedEntityId = '${sobjectId}'`)
      .sort(sortOpts.join(','))
      .execute()
      .then(result => {
        console.log("result: ", result);
        return result;
      });
  },
  describeGlobal: () => {
    return connection
    .describeGlobal()
    .then(({ sobjects }) => {
      sobjects.reduce((descriptions, sobject) => {
        descriptions[sobject.keyPrefix] = sobject;
        return descriptions;
      }, {});
      return sobjects;
    });
  },
  fetchDescription: (sobject, descriptions) => {
    console.log("sobject", sobject);
      if (descriptions[sobject]) return Promise.resolve(descriptions[sobject]);
      descriptions[sobject] = null;

      return connection
        .sobject(sobject)
        .describe()
        .then(result => {
          result.fieldMap = result.fields.reduce(function(map, field) {
            map[field.name] = field;
            return map;
          }, {});

          var objKey = sobject.toLowerCase();
          var aliasKey = objKey.replace(/__c$/,'').replace(/^\w*__/,'').replace(/_/g,'');

          var obj = result;
          if(objKey !== aliasKey){
            acls[aliasKey + '_read'] = !!obj;
            acls[aliasKey + '_create'] = (obj && obj.createable) || false;
            acls[aliasKey + '_update'] = (obj && obj.updateable) || false;
            acls[aliasKey + '_delete'] = (obj && obj.deletable) || false;
          }

          acls[objKey + '_read'] = !!obj;
          acls[objKey + '_create'] = (obj && obj.createable) || false;
          acls[objKey + '_update'] = (obj && obj.updateable) || false;
          acls[objKey + '_delete'] = (obj && obj.deletable) || false;

          return (descriptions[sobject] = result);
        })
        .catch(error => {
          console.log(`%c>>>>  Error fetching description: `, `background-color: red; color:yellow;`, sobject, error);
          return null;
        });

    },
  getObjectInfo: (connection, sobject, id) => {
      return connection
        .sobject(sobject)
        .select('Name, FX5__Tracking_Number__c')
        .where(`Id = '0691I00000A7EpXQAV`)
        .execute({ autoFetch: true })
        .then(records => {
          const rec = records[0];
          return rec.FX5__Tracking_Number__c;
        });
    },
  uploadFile: (parentId, contentVersionData, onUploadProgress) => {
      if(!contentVersionData) return Promise.reject();

      var requestConfig = {
            headers: {
              ContentType: 'application/json',
              Accept: 'application/json',
              'Authorization': `Bearer ${connection.accessToken}`
            },
            onUploadProgress: onUploadProgress || function noOp() {}
          };
      const apiVersion = "v42.0";
      const appVersion = "DEV";
      return new Promise(function(resolve, reject) {

        return axios.post(`${appVersion === 'DEV' ? connection.instanceUrl : ''}/services/data/${apiVersion}/sobjects/ContentVersion/`, contentVersionData, requestConfig)
          .then(function(){
            console.log(`>>>> File uploaded successfully : `, contentVersionData.Title, contentVersionData);
            console.log("resolve? ", resolve);
          })
          .catch(function(err) {
            var error = (err.response && err.response.data && err.response.data[0]) || err;
            reject(error);
          })
          .then(resolve,reject);
      });
    },
    downloadFile: (e, id) => {
      var requestConfig = {
        headers: {
          ContentType: 'blob',
          Accept: 'application/json',
          'Authorization': `Bearer ${connection.accessToken}`
        }
      };
      const apiVersion = "v42.0";
      const appVersion = "DEV";
      const responseType = "blob";

      return new Promise(function(resolve, reject) {
        return axios.get(`${appVersion === 'DEV' ? connection.instanceUrl : ''}/services/data/${apiVersion}/sobjects/ContentDocument/`+ e, requestConfig, responseType)
        .then((response) => {
          const fileName = response.data.Title;
          const downloadUrl = connection.instanceUrl + "/sfc/servlet.shepherd/document/download/" + e;
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.setAttribute("download", fileName);
          link.click();
        })
        .then(resolve, reject);
      })
    },
    toggleSyncFlag: (file) => {
      console.log("file, files, item", file)
      return connection
        .sobject('ContentVersion')
        .update({Id: file.LatestPublishedVersionId, FX5__Sync__c: !file.sync})
        .then(result => {
          if (!result.success) {
            console.error(result.errors);
            return result.errors;
          }
          console.log("result: ", result);
          return result.success;
        });
    }
  }


};

let lightningEventsCallback;
let updateCellCallback;

const events = {
  handleSelectedRows: rowIds => {
    console.log({ rowIds });
  },
  handleOpenRtf: (mode, rowId, apiName, label, rtfCallback) => {
    console.log('handle open RTP:', mode, rowId, apiName, label, rtfCallback);
    const data = {
      source: 'from_rtf',
      itemId: rowId,
      field: apiName,
      value: '<p>Value changed</p>',
      callback: rtfCallback
    };
    updateCellCallback(data);
  },
  initializeLightningEvents: callbackRef => {
    lightningEventsCallback = callbackRef;
  },
  initializeUpdateCell: callbackRef => {
    updateCellCallback = callbackRef;
  }
};

const eventService = () => {
  return {
    refreshView: () => console.log('Triggered force:refreshView')
  };
};

export { lightningEventsCallback, updateCellCallback, createDataService, events, eventService };
