import React, { Component } from 'react';
import { Collapse, Nav, Navbar, NavbarBrand, Input, NavbarToggler, NavbarText, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';

import { withRouter } from 'react-router-dom';

import AuthenticationService from '../services/AuthenticationService';
import BackendService from '../services/BackendService';

import Modal from "react-modal";

class AppNavbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      show: false
    };
    this.toggle = this.toggle.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);

    this.state = {
      showUser: false,
      showPM: false,
      showAdmin: false,
      username: undefined,
      password:undefined,
      login: false
    };
  }

  componentDidMount() {
    const user = AuthenticationService.getCurrentUser();
    console.log("user",user);

    if (user) {
      const roles = [];

      user.authorities.forEach(authority => {
        roles.push(authority.authority)
      });
  
      this.setState({
        showUser: true,
        showPM: roles.includes("ROLE_PM") || roles.includes("ROLE_ADMIN"),
        showAdmin: roles.includes("ROLE_ADMIN"),
        login: true,
        username: user.username
      });
    }
  }

  signOut = () => {
    AuthenticationService.signOut();
    this.props.history.push('/home');
    window.location.reload();
  }

  deleteUser = () => {
    console.log("block delete",{username:this.state.username, password:this.state.password});
    BackendService.deleteUser(this.state.username,this.state.password);
    //this.props.history.push('/home');
    //window.location.reload();
  }

  changeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    this.setState({[nam]: val});
  }

  showModal = () => {
    this.setState({ show: true });
  };

  hideModal = () => {
    this.setState({ show: false });
  };

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
  };

  render() {
    const isLogedIn=this.state.login;

    return (<>
    <Modal 
    isOpen={this.state.show}
    onRequestClose={this.hideModal}
    style={this.customStyles}
    >
      <div class="modalText">
      Password required
      </div>
      <Input autoFocus 
        type="text"
        name="password" id="password"
        value={this.state.password}
        placeholder="Enter password"
        autoComplete="password"
        onChange={this.changeHandler}
      />
      <button class="marge" onClick={this.deleteUser}>Comfirm</button>
      <button class="marge" onClick={this.hideModal}>Fermer</button>
    </Modal>
    <Navbar color="dark" dark expand="md">
      <NavbarBrand tag={Link} to="/home">NE leaderboard</NavbarBrand>
      <Nav className="mr-auto">
        <NavLink href="/home">Home</NavLink>
        {/*this.state.showUser && <NavLink href="/user">User</NavLink>}
        {this.state.showPM && <NavLink href="/pm">PM</NavLink>}
        {this.state.showAdmin && <NavLink href="/admin">Admin</NavLink>*/}
        {isLogedIn?(
        <NavLink href="/profile">Profile</NavLink>):(<div/>)}
      </Nav>
      <NavbarToggler onClick={this.toggle}/>
      <Collapse isOpen={this.state.isOpen} navbar>
        {
          this.state.login ? (
            <Nav className="ml-auto" navbar>
              <NavItem>
                  <NavbarText>
                    Signed in as: <a href="/profile">{this.state.username}</a>
                  </NavbarText>
              </NavItem>
              <NavItem>
                <NavLink href="#" onClick={this.signOut}>SignOut</NavLink>
              </NavItem>
              <NavItem>
                <button type="button" onClick={this.showModal}>Delete</button>
              </NavItem>
            </Nav>                 
          ) : (
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/signin">Login</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/signup">SignUp</NavLink>
              </NavItem>
            </Nav>
          )
        }
      </Collapse>
    </Navbar></>);
  }
}

export default withRouter(AppNavbar);