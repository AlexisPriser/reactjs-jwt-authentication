import React, { Component } from 'react';
import BackendService from '../services/BackendService';

class ScoreList extends Component{
    constructor(props) {
    super(props);
    this.state={
      list:[],
      content: "",
      error: ""
    }
  }

  componentDidMount() {
    if(this.props.user===true){
    BackendService.getScoreListUser()
      .then( response => {
        this.setState({list: response.data.run})
        console.log("list run",response.data.run);
      } , error => {
        console.log(error);
        this.setState({
          error: error.toString()
        }); 
      });
    }else{
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
    }
  }

  render() {
    return (
        <div class={"wrap"}>
            <div class={"spacing"}/>
            {this.state.list.length ?(
            <table>
                <tr class={"tlabels"}>
                <th>utilisateur</th>
                <th>date</th>
                <th>score</th>
                <th>arme 1</th>
                <th>arme 2</th>
                <th>perso</th>
                <th>zone</th>
                <th>morts</th>
                <th>tué par</th>
                </tr>
                {
                
                this.state.list.map((data,i)=>{
                    return (<tr key={i}>
                    <th>{data.User.username}</th>
                    <th>{data.date}</th>
                    <th>{data.score}</th>
                    <th>{data.Arme1.nom}</th>
                    <th>{data.Arme2.nom}</th>
                    <th>{data.Perso.nom}</th>
                    <th>{data.zone}</th>
                    <th>{data.kills}</th>
                    <th>{data.enemy.nom}</th>
                    </tr>);
                })
                }
            </table>
            ):(<div class="defaultMessage"> Pas de scores enregistrés</div>)}
            <div class={"spacing"}/>
        </div>
    );
  }

}

export default ScoreList;