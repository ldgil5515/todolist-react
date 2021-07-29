import React, { Component } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { withRouter } from 'react-router-dom';
import Showtodo from '../Components/showtodo.js'
import axios from 'axios';
axios.defaults.withCredentials = true;

class MainPage extends Component {
  constructor(props){
    super(props);
    this.state ={
      todo: [],
      entertext: "",
    }
  }

  logoutAPI = async () => {
    await axios({
      method: 'delete',
      url: "http://localhost:3001/logout",
    }).then((response)=>{
      alert(response.data.status);
    })
    this.props.history.push('/login');
  }

  onChange = (e) => {
    this.setState({
      entertext: e.target.value
    })
  }

  showLists = () => {
    let showlists=[];
    try {
      showlists=this.state.todo.map(todo => {
        return (
          <Showtodo key={todo.id} todo={todo} delete={this.delete} edit={this.edit} />
        )
      })
    } catch(err){
      console.log("ERROR!!", err.message);
    }
  
    return showlists;
  }

  create = () => {
    axios({
      method: 'post',
      url: "http://localhost:3001/todo",
      data: {
        memo: this.state.entertext
      }
    }).then((res) => {
      this.load();
    }).catch((Error) => {
      console.log(Error);
    });
    this.setState({
      entertext: ""
    });
  }

  load = () => {
    axios.get("http://localhost:3001/todo", {
      params: {
        username: this.props.username
      }
    })
    .then((response)=>{
      this.setState({
        todo: response.data
      })
    })
  }

  edit = (indexId, editText) => {
    axios({
      method: 'put',
      url: "http://localhost:3001/todo",
      data: {
        memoid: indexId,
        memo: editText
      }
    }).then(() => {
      this.load();
    })
  }

  delete = (indexId) => {
    axios({
      method: 'delete',
      url: "http://localhost:3001/todo",
      data: {
        memoid: indexId
      }
    }).then(() => {
      this.load();
    })
  }
  
  isToken = () => {
    axios({
      method: 'get',
      url: "http://localhost:3001/isToken",
    })
    .then((response)=>{
      if(!response.data.status) this.props.history.push('/login');
    })
    .catch(()=>{
      this.props.history.push('/login');
    })
  }

  componentDidMount() {
    this.isToken()
    this.load();
  }

  render() {
    return (
      <div className="BoxA">
          <div className="Title">
            <header>
              <h2>TO DO LIST</h2>
            </header>
            <input type="button" id="logoutbutton" onClick={() => {
              this.logoutAPI();
            }}/>
            <div className="container">
              <input type="text" className="tododata" onChange={(e)=>this.setState({ entertext: e.target.value })} value={this.state.entertext} />
              <FontAwesomeIcon icon={faPlusCircle} id="EnterButton" value={this.state.entertext} onClick={() => {
                this.create();
              }}></FontAwesomeIcon>
            </div>
          </div>
          <div className="showtodo">
            <ul>
              {this.showLists()}
              {/* <showLists todo={this.state.todo}/> */}
            </ul>
          </div>
        </div>
    );
  }
}

export default withRouter(MainPage)