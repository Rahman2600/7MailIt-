import React from "react";
import axios from 'axios';
import Table from "../components/Table";


// const DATA_LINK = "https://cif088g5cd.execute-api.us-east-1.amazonaws.com/v1/campaign-logs"


class CampaignLogTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
        
    }

    // var header = { headers: {
    //      "x-api-key": process.env.REACT_APP_AWS_TEMPLATE_LOG_API_KEY
    // }};
    // axios.get(DATA_LINK, header).then(response => {
    //     let table = this.dataToTable(response.data);
    //     console.log(table);
    //     this.setState({table: table})
    // });





    // TODO
    // 1) obtain data from LogDataset, using logData POST API and getcampaignlogdata lambda
    // 2) populate the front end table
    getLogTableData() {
        // var data = JSON.stringify({
        //     "min": 0,
        //     "max": 5
        // });

        var config = {
            method: 'post',
            // url: 'https://cif088g5cd.execute-api.us-east-1.amazonaws.com/v1/logs',
            url: 'https://ue4fr66yvj.execute-api.us-east-1.amazonaws.com/logStage', // this is the right one for POST logData - solved!
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.REACT_APP_AWS_TEMPLATE_LOG_API_KEY  // I belive you need to create api key in  api getaway => logdata => settings
            }
        };

        axios(config)
            .then(response => {
                this.sortTemplateLogs(response.data);
                let table = this.dataToTable(response.data);
                this.setState({table: table})
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    componentDidMount() {
        this.getLogTableData()
    }







    render() {
        console.log(this.state.table)
        return ( 
            <div className="col-lg-9 pl-0 pr-1">
                <Table data={this.state.table}/>
            </div>        
        );
    }

    dataToTable(data) {
        let columnTitles = [
            {displayName:"File Name", apiName: "TemplateName"}, 
            {displayName:"Date of Campaign Launch", apiName: "SentDateTime"}, 
            {displayName:"No. of People Emailed", apiName: "NumEmailed"}, 
            {displayName:"No. of Emails Successfully Delivered", apiName: "NumSuccessfullyDelivered"},
            {displayName:"No. of Opened Emails", apiName: "NumOpened"},
            {displayName:"No. of Links Opened", apiName: "NumLinks"},
            {displayName:"Email Log", apiName: ""}
        ];
        let table = {columns: []};
        if (data.statusCode === 200) {
            for (let i = 0; i < columnTitles.length; i++) {
                let columnTitle = columnTitles[i];
                table.columns.push({
                    title: columnTitle.displayName,
                    content: this.getContent(columnTitle, data)
                });
            }
        } else {
            console.log("Request failed with " + data.statusCode)
        }
        let templateKeyColumn = this.getColumnWithDisplayName("File Name", table);
        table.numRows = templateKeyColumn.content.length;
        return table;
    }

    getContent(columnTitle, data) {
        let content = [];
        for (let row of data.body) {
           let apiName = columnTitle.apiName;
            switch (columnTitle.displayName) {
                case "Date of Campaign Launch": {
                    let value = row[columnTitle.apiName];
                    if (value) {
                        let dateObj = new Date(value);
                        var date = dateObj.getDate();
                        var month = dateObj.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
                        var year = dateObj.getFullYear();
                            
                        var dateString = date + "/" + month + "/" + year;
                        content.push(dateString);
                    } else {
                        content.push(" ");
                    }
                    break;
                }
                case "No. of People Emailed": {
                    content.push(row['NumEmailed'].toString());
                    break;
                }
                case "No. of Emails Successfully Delivered": {
                    let value = row['NumSuccessfullyDelivered'].toString();
                    content.push(value);
                    break;
                }
                case "No. of Opened Emails": {
                    let value = row['NumOpened'].toString();
                    content.push(value);
                    break;
                }
                case "No. of Links Opened": {
                    let value = row['NumLinks'].toString();
                    content.push(value);
                    break;
                }
                default:
                    if (apiName) {;
                        content.push(row[columnTitle.apiName]);
                    }
                }
        }
        return content;
    }


    getColumnWithDisplayName(displayName, table) {
        for (let column of table.columns) {
            if (column.title === displayName) {
                return column;
            }
        }
    }


}

export default CampaignLogTable;
