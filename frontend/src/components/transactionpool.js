import React, {Component} from 'react';
import Transaction from './transaction';
import { Button} from 'react-bootstrap';


class Transactionpool extends Component {
    constructor(props){
        super(props)
        this.state={ transactionmap:{}
        };
    }

    componentDidMount(){
        fetch('http://localhost:3001/api/transactionpool')
        .then(res=>res.json())
        .then(data=>this.setState({transactionmap:data}));
    }

    mineTransaction(){
        
        fetch('http://localhost:3001/api/minetransactions')
        .then(res=>{
            if(res.status===200){
                alert('Sucess !!!')
            }else{
                alert("Mine Transaction Failed")
            }
        })
    }

    render(){
    
        return (
        <div className="App" >
            <div >
            <a href='/'>HOME</a>
            </div>
            <br />
            <h2>TRANSACTION POOL</h2>
            <br />
            {Object.values(this.state.transactionmap).map(transaction=>{
                return(
                    <div className="Transactionpool" key={transaction.id}>
                        <Transaction transaction={transaction} />
                        <hr />
                    </div>)
                })
            }
            <Button 
                variant="warning"
                onClick={this.mineTransaction}
                >Mine Transaction</Button>
            <div>
             <br />
             <a href='/blocks'>BLOCKS CHAIN</a>
            </div>
        </div>
        );
  }
}

export default Transactionpool;