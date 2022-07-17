import React from "react";
import { Segment, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import FileModal from "./FileModal";
import uuidv4 from "uuid/v4";

class MessagesForm extends React.Component {
    state = {
        message: '',
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        isLoading: false,
        showModal: false,
        errors: [],
        storageRef: firebase.storage().ref(),
        uploadTask: null,
        uploadState: "",
        percentUploaded: 0,
    };
    componentWillUnmount() {
        if (this.state.uploadTask !== null) {
            this.state.uploadTask.cancel();
            this.setState({
                uploadTask: null
            });
        }
    };
    handelChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        })
    };
    createMsg = (fileUrl = null) => {
        const message = {
            content: this.state.message,
            timeStamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL,
            }
        };
        if (fileUrl !== null) {
            message["image"] = fileUrl;
        }
        else {
            message["content"] = this.state.message;
        }
        return message;
    };
    sendMsg = (event) => {
        const { getMessagesRef } = this.props;
        const { message, channel } = this.state;
        if (message) {
            this.setState({
                isLoading: true,
            });
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMsg())
                .then(() => {
                    this.setState({
                        message: '',
                        isLoading: false,
                        errors: [],
                    });
                }).catch((error) => {
                    console.log(error);
                    this.setState({
                        isLoading: false,
                        errors: this.state.errors.concat(error)
                    });
                });
        }
        else {
            this.setState({
                errors: this.state.errors.concat({ message: "Add a message" })
            });
        }
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
    getPath = () => {
        if (this.props.isPrivateChannel) {
            return `chat/private/${this.state.channel.id}`;
        }
        else {
            return "chat/public";
        }
    };
    uploadFile = (file, metadata) => {
        const pathToUpload = this.state.channel.id;
        const ref = this.props.getMessagesRef();
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`;
        this.setState(
            {
                uploadState: "uploading",
                uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
            }, () => {
                this.state.uploadTask.on(
                    "state_changed", snap => {
                        const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                        this.setState({
                            percentUploaded
                        });
                    }, err => {
                        console.error(err);
                        this.setState({
                            errors: this.state.errors.concat(err),
                            uploadState: "error",
                            uploadTask: null
                        });
                    }, () => {
                        this.state.uploadTask.snapshot.ref
                            .getDownloadURL()
                            .then(downloadUrl => {
                                this.sendFileMessage(downloadUrl, ref, pathToUpload);
                            }).catch(err => {
                                console.error(err);
                                this.setState({
                                    errors: this.state.errors.concat(err),
                                    uploadState: "error",
                                    uploadTask: null
                                });
                            });
                    }
                );
            }
        );
    };
    sendFileMessage = (fileUrl, ref, pathToUpload) => {
        ref
            .child(pathToUpload)
            .push()
            .set(this.createMsg(fileUrl))
            .then(() => {
                this.setState({
                    uploadState: "done"
                });
            }).catch(err => {
                console.error(err);
                this.setState({
                    errors: this.state.errors.concat(err)
                });
            });
    };


    render() {
        const { errors, message, isLoading, showModal, uploadState } = this.state;

        return (
            <Segment className="messages-form">
                <Input
                    fluid name="message"
                    onChange={this.handelChange}
                    className={
                        errors.some(error => error.message.includes("message")) ? "error" : ""
                    }
                    value={message}
                    style={{ marginBottom: '0.7em' }}
                    // label={<Button icon={'add'} />}
                    labelPosition="left"
                    placeholder="Enter the message"
                />
                <Button.Group icon widths="2">
                    <Button
                        onClick={this.sendMsg}
                        disabled={isLoading}
                        color="pink"
                        content="Send"
                        labelPosition="left"
                        icon="edit"
                    />
                    <Button
                        onClick={this.openModal}
                        disabled={uploadState === "uploading"}
                        color="olive"
                        content="Send image"
                        labelPosition="right"
                        icon="upload"
                    />
                    <FileModal
                        showModal={showModal}
                        closeModal={this.closeModal}
                        uploadFile={this.uploadFile}
                    />
                </Button.Group>
            </Segment>
        )
    }
}

export default MessagesForm;