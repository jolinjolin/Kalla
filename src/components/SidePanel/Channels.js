import firebase from '../../firebase';
import React from 'react';
import { Icon, Menu, Modal, Form, Input, Button, Label } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions';

class Channels extends React.Component {
    state = {
        user: this.props.currentUser,
        channels: [],
        channelName: '',
        channelDetails: '',
        activeId: '',
        showModal: false,
        channelsRef: firebase.database().ref('channels'),
        firstLoad: true,
        channel: null,
        messagesRef: firebase.database().ref('messages'),
        notifications: [],
    };
    componentDidMount() {
        this.addListeners();

    };
    componentWillUnmount() {
        this.removeListeners();
    };
    addNotificationListener = channelId => {
        this.state.messagesRef.child(channelId).on("value", snap => {
            if (this.state.channel) {
                this.handleNotifications(
                    channelId,
                    this.state.channel.id,
                    this.state.notifications,
                    snap
                );
            }
        });
    };
    addListeners = () => {
        let loadChannels = [];
        this.state.channelsRef.on('child_added', snap => {
            loadChannels.push(snap.val());
            this.setState({
                channels: loadChannels
            }, () => this.setFirstChannel());
            this.addNotificationListener(snap.key);
        });
    };
    removeListeners = () => {
        this.state.channelsRef.off();
        this.state.channels.forEach(el => {
            this.state.messagesRef.child(el.id).off();
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
    handleChange = event => {
        this.setState({
            [event.target.name]: event.target.value
        })
    };
    formValid = ({ channelName, channelDetails }) => {
        return channelName && channelDetails;
    };
    addChannel = () => {
        const { channelsRef, channelName, channelDetails, user } = this.state;
        const key = channelsRef.push().key;
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: user.displayName,
                avatar: user.photoURL,
            }
        };

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({
                    channelName: '',
                    channelDetails: '',
                });
                this.closeModal();
                // console.log("channel added");
            }).catch((error) => {
                console.log(error);
            });
    };
    displayChannels = channels =>
        channels.length > 0 && channels.map(el => (
            <Menu.Item
                key={el.id}
                onClick={() => this.updateChannel(el)}
                name={el.name}
                style={{ opacity: 0.7 }}
                active={el.id === this.state.activeId}
            >
                {this.getNotificationCount(el) &&
                    <Label color="red">{this.getNotificationCount(el)}</Label>
                }
                # {el.name}
            </Menu.Item>
        ))
    setFirstChannel = () => {
        const firstChannel = this.state.channels[0];
        if (this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({
                channel: firstChannel
            });
        }
        this.setState({
            firstLoad: false
        });
    };
    setActiveChannel = (channel) => {
        this.setState({
            activeId: channel.id
        });
    };
    updateChannel = (channel) => {
        this.setActiveChannel(channel);
        this.clearNotications();
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel });

    };
    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;

        let index = notifications.findIndex(
            notification => notification.id === channelId
        );

        if (index !== -1) {
            if (channelId !== currentChannelId) {
                lastTotal = notifications[index].total;

                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren();
        } else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            });
        }

        this.setState({ notifications });
    };
    clearNotications = (channel) => {
        let index = this.state.notifications.findIndex(el => el.id === this.state.channel.id)
        if (index !== -1) {
            let notifications = [...this.state.notifications];
            notifications[index].total = this.state.notifications[index].lastKnownTotal;
            notifications[index].count = 0;
            this.setState({
                notifications: notifications
            });
        }
    };
    getNotificationCount = (channel) => {
        let count = 0;
        this.state.notifications.forEach(el => {
            if (el.id === channel.id) {
                count = el.count;

            }
        });
        if (count > 0) {
            return count;
        }
    };
    submit = event => {
        event.preventDefault();
        if (this.formValid(this.state)) {
            this.addChannel();
        }
    };

    render() {
        const { channels, showModal } = this.state;

        return (
            <React.Fragment>
                <Menu.Menu className="menu">
                    <Menu.Item>
                        <span>
                            <Icon name="chevron down" />CHANNELS
                        </span>
                        {"  "}
                        ({channels.length})
                        <Icon name="add" onClick={this.openModal} />
                    </Menu.Item>
                    {this.displayChannels(channels)}
                </Menu.Menu>

                <Modal basic open={showModal} onClose={this.closeModal}>
                    <Modal.Header>
                        Add a channel
                    </Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.submit}>
                            <Form.Field>
                                <Input fluid label="Name of channel" name="channelName" onChange={this.handleChange} />
                            </Form.Field>
                            <Form.Field>
                                <Input fluid label="About the channel" name="channelDetails" onChange={this.handleChange} />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.submit}>
                            <Icon name="checkmark" />Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" />Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        )
    }
}

export default connect(null,
    { setCurrentChannel, setPrivateChannel }
)(Channels);