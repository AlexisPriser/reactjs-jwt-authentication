import axios from 'axios';

// Add a request interceptor
axios.interceptors.request.use( config => {
  const user = JSON.parse(localStorage.getItem('user'));

  if(user && user.accessToken){
    const token = user.accessToken;
    config.headers['x-access-token'] = token;
  }

  console.log("conf headers",config.headers);

  return config;
});

class BackendService {

  async getScoreList() {
    return await axios.get("/api/get/run");
  }

  async getScoreListUser() {
    return await axios.get("/api/get/runuser");
  }

  async getUserBoard() {
    return await axios.get("/api/test/user");
  }

  async getPmBoard() {
    return await axios.get("/api/test/pm");
  }

  async getAdminBoard() {
    return await axios.get("/api/test/admin");
  }

  async deleteUser(username,password){
    return await axios.post("/api/delete/user",{password:password, username:username}).then(res=>{
      console.log("BackendService:",res);
      if(res.data.reason==='User Deleted.'){
        console.log("BackendService: user deleted");
      localStorage.removeItem("user");
      }
    });
  }
}

export default new BackendService();