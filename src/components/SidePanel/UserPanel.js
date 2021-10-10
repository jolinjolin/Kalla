import firebase from '../../firebase';
import React from 'react';
import { Dropdown, Grid, Header, Icon, Image, Input, Modal, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import AvatarEditor from 'react-avatar-editor';


class UserPanel extends React.Component {
    state = {
        user: this.props.currentUser,
        showModal: false,
        previewImage: '',
        croppedImage: '',
        blob: '',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        uploadloadedCroppedImage: '',
        usersRef: firebase.database().ref("users"),
        metadata: {
            contentType: 'image/jpeg'
        }
    };
    componentDidMount() {
        this.setState({
            user: this.props.currentUser,
        })
    };
    signOut = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                // console.log("sign out")
            });
    };
    openModal = () => {
        this.setState({
            showModal: true
        });
    };
    closeModal = () => {
        this.setState({
            showModal: false
        });
    };
    handleChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                this.setState({
                    previewImage: reader.result
                });
            });
        }
    };
    handleCrop = () => {
        if (this.avatarEditor) {
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob);
                this.setState({
                    croppedImage: imageUrl,
                    blob
                });
            });
        }
    };
    uploadImage = () => {
        const { storageRef, userRef, blob, metadata } = this.state;
        storageRef
            .child(`avatars/user/${userRef.uid}`)
            .put(blob, metadata)
            .then(snap => {
                snap.ref.getDownloadURL().then(downloadURL => {
                    this.setState({ uploadedCroppedImage: downloadURL }, () =>
                        this.changeAvatar()
                    );
                });
            });
    };
    changeAvatar = () => {
        this.state.userRef
            .updateProfile({
                photoURL: this.state.uploadedCroppedImage
            })
            .then(() => {
                // console.log("PhotoURL updated");
                this.closeModal();
            })
            .catch(err => {
                console.error(err);
            });

        this.state.usersRef
            .child(this.state.user.uid)
            .update({ avatar: this.state.uploadedCroppedImage })
            .then(() => {
                // console.log("Avatar changed");
            })
            .catch(err => {
                console.error(err);
            });
    };
    dropdownOptions = () => [
        {
            key: 'user',
            text: <span>Signed in as <strong>{this.state.user.displayName}</strong></span>,
            disabled: true,
        },
        {
            key: 'avatar',
            text: <span onClick={this.openModal}>Change avatar</span>,
        },
        {
            key: 'signout',
            text: <span onClick={this.signOut}>Sign out</span>,
        },
    ]

    render() {
        const { user, showModal, previewImage, croppedImage, } = this.state;
        return (
            <Grid style={{ background: "#008080" }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: "1.2em", mrgin: "0" }}>
                        <Header inverted floated="left" as="h2">
                            <Icon name="discussions" />
                            <Header.Content>
                                Kalla
                            </Header.Content>
                        </Header>
                    </Grid.Row>
                    <Grid.Row style={{ padding: "1.2em", mrgin: "0" }}>
                        <Header style={{ padding: '0.25em' }} as="h4" inverted>
                            <Dropdown trigger={
                                <span>
                                    <Image src={user.photoURL} spaced='right' avatar />
                                    {user.displayName}
                                </span>
                            } options={this.dropdownOptions()} />
                        </Header>
                    </Grid.Row>
                    <Modal basic open={showModal} onClose={this.closeModal}>
                        <Modal.Header>
                            Change avatar
                        </Modal.Header>
                        <Modal.Content>
                            <Input
                                fluid
                                onChange={this.handleChange}
                                type="file"
                                label="New avatar"
                                name="previewImage"
                            />
                            <Grid centered stackable columns={2}>
                                <Grid.Row centered>
                                    <Grid.Column className="ui center aligned grid">
                                        {previewImage &&
                                            <AvatarEditor
                                                ref={node => (this.avatarEditor = node)}
                                                image={previewImage}
                                                width={100}
                                                height={100}
                                                border={50}
                                                scale={1.2}
                                            />
                                        }
                                    </Grid.Column>
                                    <Grid.Column>
                                        {croppedImage && (
                                            <Image
                                                style={{ margin: '3.5em auto' }}
                                                width={80}
                                                height={80}
                                                src={croppedImage}
                                            />
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Modal.Content>
                        <Modal.Actions>
                            {croppedImage && <Button color="purple" inverted onClick={this.uploadImage}>
                                <Icon name="save" /> Change avatar
                            </Button>}
                            <Button color="purple" inverted onClick={this.handleCrop}>
                                <Icon name="image" /> Preview
                            </Button>
                            <Button color="orange" inverted onClick={this.closeModal}>
                                <Icon name="remove" /> remove
                            </Button>
                        </Modal.Actions>
                    </Modal>
                </Grid.Column>

            </Grid>
        )
    }
}

const mapStateToProps = state => ({
    currentUser: state.user.currentUser,
})

export default connect(mapStateToProps)(UserPanel);