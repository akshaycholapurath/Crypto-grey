import React, {Component} from 'react';
import Block from './block';


class Blocks extends Component {
    constructor(props){
        super(props)
        this.state={ blocks:[]
        };
    }

    componentDidMount(){
        fetch(`${document.location.origin}/api/blocks`)
        .then(res=>res.json())
        .then(data=>this.setState({blocks:data}));
    }

    render(){
    
        return (
        <div className="App" >
            <div >
            <a href='/'>HOME</a>
            </div>
            <br />
            <h2>BLOCKS</h2>
            {
                this.state.blocks.slice(0).reverse().map(block=>{
                    return(
                        <Block key={block.hash} block={block} />
                    );
                })
            }
        </div>
        );
  }
}

export default Blocks;