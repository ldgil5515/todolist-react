import React, { Component } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";

class showtodo extends Component {
  constructor(props){
    super(props);
    this.state = {
      active: false,
      entertext: ""
    }
  }

  onChange = (e) => {
    this.setState({
      entertext: e.target.value
    })
  }

  render() {
    return (
      <div className="showlist">
        {!this.state.active?(
          <li>
            {this.props.todo.memo}
          </li>
          ):(
          <input type="text" className="editbox" onChange={this.onChange} value={this.state.entertext}/>
        )}
        
        <FontAwesomeIcon icon={faTrashAlt} className="close" onClick={()=>{
            this.props.delete(this.props.todo.id);
          }}/>
        <FontAwesomeIcon icon={faPencilAlt} className="edit" onClick={()=>{
          this.state.active?(this.props.edit(this.props.todo.id,this.state.entertext)):(
            this.setState((prevState) => ({
              entertext: this.props.todo.memo,
            })))
          this.setState((prevState) => ({
            active: !prevState.active,
          }))
        }}/>
      </div>
    );
  }
}

export default showtodo;
