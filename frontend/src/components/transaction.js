import React, {Component} from 'react';


class Transaction extends Component {
    constructor(props){
        super(props)
        this.state={ 
        };
    }

    render(){
        const{input,outputMap} = this.props.transaction;
        const recipients = Object.keys(outputMap);
        return (
        <div className="transaction" >
            <hr />
            From:`${input.address.substring(0,25)}...` 
            <br />
            Balance: {input.amount}   
            {
                recipients.map(recipient=>{
                    return(
                        <div key={recipient}>
                            To: `${recipient.substring(0,25)}...` 
                            <br />
                            Amount: {outputMap[recipient]}
                        </div> 
                    )
                })
            }
            
        </div>
        );
  }
}

export default Transaction;