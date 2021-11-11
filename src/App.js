import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import 'tachyons';
import Particles from 'react-particles-js';



const particlesOptions = {
  particles: {
    number : {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: { id : '',
	            name: '',
		          email: '',
		          entries: 0,
		          joined: ''
      }
    }

class App extends Component {

  constructor() {
    super();
    this.state = initialState
  } 

/*
  This method is called when finish to mount this component (in this case Main Component)

  componentDidMount = () => {

    fetch('http://192.168.56.210:35907/')
    .then(response => response.json())
    .then(console.log)
  }
*/

  loadUser = (data) => {
    this.setState( {user: {
        id : data.id,
	      name: data.name,
		    email: data.email,
		    entries: data.entries,
		    joined: data.joined
    }} )
  }

  calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
        const image = document.getElementById('inputImage');

        const width = Number(image.width);
        const height = Number(image.height);
        
        console.log('width : ' + width + ' height : ' + height);

        return {
          leftCol: clarifaiFace.left_col * width,
          topRow: clarifaiFace.top_row * height,
          rightCol: width - (clarifaiFace.right_col * width),
          bottomRow: height - (clarifaiFace.bottom_row * height)
        }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onRouteChange = (route) => {
    if ( route === 'signout' ) {
       this.setState(initialState);
    } else if ( route === 'home' ) {
      this.setState({isSignedIn : true});
    }
    this.setState({route : route});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
    console.log(event.target.value);
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
      fetch('https://glacial-everglades-06630.herokuapp.com/imageurl', {
			             method: 'post',
			             headers: {'Content-Type': 'application/json'},
			             body: JSON.stringify({
			             	input: this.state.input})
		  })
      .then(response => response.json())
      .then(response => {
        if ( response ) {
          		fetch('https://glacial-everglades-06630.herokuapp.com/image', {
			               method: 'put',
			               headers: {'Content-Type': 'application/json'},
			               body: JSON.stringify({
			                   	id: this.state.user.id})
		          })
              .then(response => response.json())
              .then(count => {
                // In questo modo modifico solo entries e rimangono inalterati tutti gli altri attributi dell'oggetto user
                this.setState(Object.assign(this.state.user,{entries: count}))
              })
              .catch(console.log('Error in connection with server.'))
        }
        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch(err => console.log(err));

  }

  render() {
//    Altro modo per settare 
//    const { imageUrl } = this.state;
    const {box, imageUrl, route, isSignedIn} = this.state;
    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions}/>
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' ?
           <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
                  onInputChange={this.onInputChange}
                  onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition box={box} imageUrl={imageUrl}/>
            </div>  
          : ( route === 'signin' || route === 'signout' ?
                  <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>    
          )  
        }
      </div>
    );
  }
}

export default App;
