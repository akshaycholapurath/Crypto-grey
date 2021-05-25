import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import Transaction from './transaction';


class Block extends Component {
    constructor(props){
        super(props)
        this.state = {
            displayTransaction:false
        }
    }

    toggleTransaction = ()=>{
        this.setState({displayTransaction:!this.state.displayTransaction})
    };

    get displayTransaction(){
        const {data} = this.props.block;
        const stringifiedData = JSON.stringify(data);

        const dataDisplay = `${stringifiedData.substring(0,45)}...`;

        if(this.state.displayTransaction){
            return(
                <div>
                    {
                        data.map(transaction=> <Transaction transaction={transaction} />)
                    }
                    <br />
                    <Button variant="dark" 
                        size="sm"
                        onClick = {this.toggleTransaction}
                        >Show Less</Button>
                </div>
            )
        }
        return(
            <div>
                <div>Data: {dataDisplay}</div>
                <div>
                <Button variant="dark" 
                        size="sm"
                        onClick = {this.toggleTransaction}
                        >Show More</Button>
                </div>
            </div>
        )
    }

    render(){
        const {timestamp,hash} = this.props.block;

        const hashDisplay = `${hash.substring(0,25)}...`;
       
        return (
        <div >
            <div className="Block" key={hash}>
                <div>
                 Timestamp: {new Date(timestamp).toLocaleString()}
                </div>
                <div>
                 Hash: {hashDisplay}
                </div>  
                <div>
                 {this.displayTransaction}
                </div>   
            </div>
        </div>
        );
  }
}


export default Block;