import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import firebase from '../../firebase';
import md5 from 'md5';

class Register extends React.Component {
    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users'),
    };
    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    };
    handleInputError = (errors, input) => {
        return errors.some(error => error.message.toLowerCase().includes(input)) ? 'error' : '';
    };
    formEmpty = ({ username, email, password, passwordConfirmation }) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length;
    };
    passwordValid = ({ password, passwordConfirmation }) => {
        if (password.length < 6 || passwordConfirmation.length < 6) {
            return false;
        }
        else if (password !== passwordConfirmation) {
            return false;
        }
        else {
            return true;
        }
    };
    formValid = () => {
        let errors = [];
        if (this.formEmpty(this.state)) {
            let error = {
                message: "Please fill in the required fileds"
            }
            this.setState({ errors: errors.concat(error) });
            return false;
        }
        else if (!this.passwordValid(this.state)) {
            let error = {
                message: "Please enter a valid password"
            }
            this.setState({ errors: errors.concat(error) });
            return false;
        }
        else {
            return true;
        }
    };
    saveUser = createUser => {
        return this.state.usersRef.child(createUser.user.uid).set({
            name: createUser.user.displayName,
            avatar: createUser.user.photoURL,
        });
    };
    showErrors = errors => errors.map((error, index) => <p key={index}>{error.message}</p>);

    submitForm = (event) => {
        if (this.formValid()) {
            this.setState({ erros: [], loading: true });
            event.preventDefault();
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(createUser => {
                    // console.log(createUser)
                    createUser.user.updateProfile({
                        displayName: this.state.username,
                        photoURL: `http://gravatar.com/avatar/${md5(createUser.user.email)}?d=identicon`
                    }).then(() => {
                        this.saveUser(createUser).then(() => {
                            // console.log("User saved")
                        })
                    }).catch((error) => {
                        console.log(error);
                        this.setState({ errors: this.state.errors.concat(error), loading: false });
                    });
                })
                .catch((error) => {
                    console.log(error);
                    this.setState({ errors: this.state.errors.concat(error), loading: false });
                })
        }
    };

    render() {
        const { username, email, password, passwordConfirmation, errors, loading } = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h2" icon color="teal" textAlign="center">
                        <Icon name="pen square" color="teal" />
                        Register for Kalla
                    </Header>
                    <Form onSubmit={this.submitForm} size="large">
                        <Segment>
                            <Form.Input className={this.handleInputError(errors, 'username')} fluid name="username" icon="user" iconPosition="left" value={username}
                                placeholder="Username" onChange={this.handleChange} type="text" />
                            <Form.Input className={this.handleInputError(errors, 'email')} fluid name="email" icon="mail" iconPosition="left" value={email}
                                placeholder="Email address" onChange={this.handleChange} type="email" />
                            <Form.Input className={this.handleInputError(errors, 'password')} fluid name="password" icon="lock" iconPosition="left" value={password}
                                placeholder="Password" onChange={this.handleChange} type="password" />
                            <Form.Input className={this.handleInputError(errors, 'password')} fluid name="passwordConfirmation" icon="repeat" iconPosition="left" value={passwordConfirmation}
                                placeholder="Password confirmation" onChange={this.handleChange} type="password" />
                            <Button disabled={loading} className={loading ? 'loading' : ''} color="teal" fluid size="large">Sumbit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.showErrors(errors)}
                        </Message>
                    )}
                    <Message>Already have an account? <Link to="/login">Login</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Register;