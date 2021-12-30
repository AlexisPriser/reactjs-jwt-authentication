import React, { Component } from 'react';
import AppNavbar from './AppNavbar';
import ScoreList from './ScoreList';
import { Link } from 'react-router-dom';
import { Button, Container } from 'reactstrap';
import { Alert } from "react-bootstrap";

class Home extends Component {

  constructor(props) {
    super(props);
    this.state={
      list:[],
      error: ""
    }
  }

  componentDidMount() {
    /*
    BackendService.getScoreList()
      .then( response => {
        this.setState({list: response.data.run})
        console.log("list run",response.data.run);
      } , error => {
        console.log(error);
        this.setState({
          error: error.toString()
        }); 
      });
      */
  }

  render() {
    return (
      <div>
        <AppNavbar/>
        <div class="title">Scores généraux</div>
        <ScoreList user={false}/>
      </div>
    );
  }
}

export default Home;