import React from 'react';
import { Segment, Comment } from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader';
import MessagesForm from './MessagesForm';
import firebase from '../../firebase';
import Message from './Message';
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions'

class MessagePanel extends React.Component {
    state= {
        messagesRef: firebase.database().ref('messages'),
        channel: this.props.currentChannel,
        user: this.props.currentUser,
        messages: [],
        numUniqueUsers: '',
        isLoading: true,
        searchTerm: '',
        searchIsLoading: false,
        searchRes: [],
        privateChannel: this.props.isPrivateChannel,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        // connectedRef: firebase.database().ref(".info/connected"),
        listeners: [],
    };
    componentDidMount() {
        const {channel, user, listeners} = this.state;
        if(channel && user) {
            this.removeListeners(listeners);
            this.addEventListener(channel.id);
        }
    };
    componentWillUnmount() {
       this.removeListeners(this.state.listeners);
    //    this.state.connectedRef.off();
    };
    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(el => 
                el.id === id && el.ref === ref && el.event === event
            )
        if(index === -1) {
            const newListener = {id, ref, event};
            this.setState({
                listeners: this.state.listeners.concat(newListener)
            });
        }
    };
    removeListeners = listeners => {
        listeners.forEach(el => {
            el.ref.child(el.id).off(el.event);
        });
    };
    messageListener = channelId => {
        let loadedMessages = [];
        const ref = this.getMessagesRef();
        ref.child(channelId).on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                isLoading: false,
            });
            this.uniqueUser(loadedMessages);
            this.userPosts(loadedMessages);
        });
        this.addToListeners(channelId, ref, 'child_added');
    };
    addEventListener = channelId => {
        this.messageListener(channelId);
    };
    uniqueUser = (messages) => {
        const users = messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        }, []);
        const isMultiple = users.length > 1 || users.length === 0;
        const numUniqueUsers = `${users.length} user${isMultiple? 's' : ''}`;
        this.setState({
            numUniqueUsers
        })
    };
    userPosts = (messages) => {
        let userPosts = messages.reduce((acc, message) => {
            if(message.user.name in acc) {
                acc[message.user.name].count += 1;
            }
            else {
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc;
        }, [])
        this.props.setUserPosts(userPosts);
    };
    displayMessages = messages =>
        messages.length > 0 && messages.map(el => (
        <Message
            key={el.timeStamp}
            message={el}
            user={this.state.user}
        />
    ));
    displayChannelName = (channel) => {
        return channel
        ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
        : "";
    }
    handleSearch = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchRes= channelMessages.reduce((acc, message) => {
            if((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
                acc.push(message);
            }
            return acc;
        }, []);
        this.setState({searchRes});
        setTimeout(() => {
            this.setState({searchIsLoading: false});
        }, 1000);
    };
    searchMsg = (event) =>{
        this.setState({
            searchTerm: event.target.value,
            searchIsLoading: true,
        }, () => {
            this.handleSearch();
        })
    };
    getMessagesRef = () => {
        const { messagesRef, privateMessagesRef, privateChannel } = this.state;
        return privateChannel? privateMessagesRef : messagesRef;
    };

    render() {
        const { messagesRef, channel, user, messages, numUniqueUsers, searchTerm, searchRes, searchIsLoading, privateChannel } = this.state;
        return (
            <React.Fragment>
                <MessagesHeader 
                channelName={this.displayChannelName(channel)}
                numUniqueUsers={numUniqueUsers}
                searchMsg={this.searchMsg}
                searchIsLoading={searchIsLoading}
                isPrivateChannel={privateChannel}
                />
                    <Segment>
                        <Comment.Group className="message">
                            {searchTerm? this.displayMessages(searchRes) : this.displayMessages(messages)}
                        </Comment.Group>
                    </Segment>
                <MessagesForm
                messagesRef={messagesRef}
                currentChannel={channel}
                currentUser={user}
                isPrivateChannel={privateChannel}
                getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        )
    }
}

export default connect(null, { setUserPosts })(MessagePanel);