import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Form, Segment, Button, Header, Message, Icon } from 'semantic-ui-react';
import firebase from '../../firebase';

class Login extends React.Component {
    state = {
        email: '',
        password: '',
        errors: [],
        loading: false,
    };
    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    };
    handleInputError = (errors, input) => {
        return errors.some(error => error.message.toLowerCase().includes(input)) ? 'error' : '';
    };
    formValid = ({ email, password }) => email && password;

    showErrors = errors => errors.map((error, index) => <p key={index}>{error.message}</p>)

    submitForm = (event) => {
        if (this.formValid(this.state)) {
            this.setState({ erros: [], loading: true });
            event.preventDefault();
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then((signedInUser) => {
                    // console.log(signedInUser)
                })
                .catch((error) => {
                    console.log(error);
                    this.setState({ errors: this.state.errors.concat(error), loading: false });
                })
        }
    }

    render() {
        const { email, password, errors, loading } = this.state;

        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as="h2" icon color="orange" textAlign="center">
                        <Icon name="paper plane outline" color="orange" />
                        Login to Kalla
                    </Header>
                    <Form onSubmit={this.submitForm} size="large">
                        <Segment>
                            <Form.Input className={this.handleInputError(errors, 'email')} fluid name="email" icon="mail" iconPosition="left" value={email}
                                placeholder="Email address" onChange={this.handleChange} type="email" />
                            <Form.Input className={this.handleInputError(errors, 'password')} fluid name="password" icon="lock" iconPosition="left" value={password}
                                placeholder="Password" onChange={this.handleChange} type="password" />
                            <Button disabled={loading} className={loading ? 'loading' : ''} color="orange" fluid size="large">Sumbit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.showErrors(errors)}
                        </Message>
                    )}
                    <Message>Don't have an account? <Link to="/register">Register</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}

export default Login