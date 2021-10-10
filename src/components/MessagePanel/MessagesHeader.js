import React from "react";
import { Header, Segment, Input, Icon } from 'semantic-ui-react';

class MessagesHeader extends React.Component {
    render() {
        const { channelName, numUniqueUsers, searchMsg, searchIsLoading,isPrivateChannel } = this.props;
        return (
            <Segment clearing>
                <Header fluid="true" as="h2" floated="left" style={{marginBottom: 0}}>
                    <span>
                        {channelName}
                        {!isPrivateChannel && <Icon name={"bookmark outline"} color="black"/>}
                    </span>
                    <Header.Subheader>
                        {numUniqueUsers}
                    </Header.Subheader>
                </Header>
                <Header floated="right">
                    <Input
                    onChange={searchMsg}
                    loading={searchIsLoading}
                    size="mini"
                    icon="search"
                    name="searchTerm"
                    placeholder="Search message">
                    </Input>
                </Header>
            </Segment>
        )
    }
}

export default MessagesHeader;