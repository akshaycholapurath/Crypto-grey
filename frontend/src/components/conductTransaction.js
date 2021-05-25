import React, {Component} from 'react';
import { Button,FormGroup,FormControl} from 'react-bootstrap';
import KnownAddress from './address';


class ConductTransaction extends Component {
    constructor(props){
        super(props)
        this.state={recipient: '',amount:"",knownAddress:[],showaddress:false}
    }

    componentDidMount(){
        fetch(`${document.location.origin}/api/knownaddress`)
        .then(res => res.json())
        .then(data=>this.setState({knownAddress:data}));
    }

    updateRecipient=(event)=>{
        this.setState({recipient:event.target.value});
    }

    toggleaddress=()=>{
        this.setState({showaddress:!this.state.showaddress})
    }

    updateAmount=(event)=>{
        this.setState({amount:Number(event.target.value)});
    }

    postTransaction=()=>{
        if(!this.state.recipient||!this.state.amount){
            return alert("Invalid Transaction");
        }
        if(this.state.recipient===this.props.address){
            return alert("Invalid Transaction");
        }

        fetch(`${document.location.origin}/api/transact`,{
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            recipient: this.state.recipient,
            amount: this.state.amount
        })
        })
        .then(res=>res.json())
        .then(json=>{
            alert(json.message||json.type);
            this.setState({recipient: '',amount:""})
        });
    }

    render(){
 
        return (
        <div>
            <div className='ConductTransaction' >
                <h3>Conduct Transaction</h3>
                <hr />
                <FormGroup>
                    <FormControl 
                        input='text'
                        placeholder='Recipient'
                        value={this.state.recipient}
                        onChange = {this.updateRecipient}
                        />
                </FormGroup>
                <br />
                <FormGroup>
                    <FormControl 
                        input='number'
                        placeholder='Amount'
                        value={this.state.amount}
                        onChange = {this.updateAmount}
                        />
                </FormGroup>
                <br />
                <Button 
                variant="dark"
                onClick={this.postTransaction}
                >Submit</Button>
                <div>
                    <br/>
                    <Button 
                    variant="danger"
                    size="sm"
                    onClick={this.toggleaddress}
                    >Known Addresses</Button>
                    {
                        this.state.showaddress?<KnownAddress knownAddress={this.state.knownAddress} />:null
                    }
                </div>
            </div>
        </div>
        );
  }
}

export default ConductTransaction;