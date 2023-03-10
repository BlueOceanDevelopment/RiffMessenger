import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, SectionList, Button, StyleSheet, StatusBar, FlatList, TextInput, SafeAreaView, Pressable, Image, KeyboardAvoidingView, TouchableOpacity, TouchableWithoutFeedback, TouchableHighlight, ScrollView, RefreshControl } from 'react-native';
import { createDrawerNavigator, useDrawerStatus } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import socket from '../utils/hooks/socket';
import SafeViewAndroid from "../utils/hooks/SafeViewAndroid";
import moment from 'moment';
import { useAuthentication } from '../utils/hooks/useAuthentication';
import axios from 'axios';
import SelectUsersModal from './SelectUsersModal';
import ChannelModal from './ChannelModal';
import CreateServerModal from './CreateServerModal';
import CreateChannelModal from './CreateChannelModal';
import InviteUserModal from './InviteUserModal';
import HoldMessageModal from './HoldMessageModal';
import { AntDesign } from 'react-native-vector-icons';

import { UserId } from '../utils/hooks/context'
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';

const LeftDrawer = createDrawerNavigator();
const RightDrawer = createDrawerNavigator();

var {width, height} = Dimensions.get('window');

const ChatScreen = ({server, channel, channelName}) => {

  const userId = React.useContext(UserId);

  const [modalVisible, setModalVisible] = useState(false);
  const [holdModalVisible, setHoldModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [replyEdits, setReplyEdits] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState({id: 0})
  const [showButton, setShowButton] = useState(false);
  const [serverID, setServerID] = useState(server);
  const [channelID, setChannelID] = useState(channel);

  useEffect(() => {
    if (server === 0) {
      axios.get(`http://${Constants.manifest?.extra?.apiUrl}/directmessages/${userId}/${channel}`)
      .then(response => {
        const messageList = Array.isArray(response.data) ? response.data : []
        setMessages(messageList);
      })
      .catch(error => {
        console.log('Error in chat screen2 ', error.message);
      });
    } else {
      axios.get(`http://${Constants.manifest?.extra?.apiUrl}/messages/${server}/${channel}`)
      .then(response => {
        setMessages(response.data);
      })
      .catch(error => {
        console.log('Error in chat screen ', error.message);
      });
    }

  }, [channel]);

  const updateMessages = (message) => {
    setMessages((messages) => {
      if (messages.findIndex(c => c.id === message.id) === -1)
      {
        return [...messages, message];
      } else {
        return [...messages];
      }
    });
  }

  useEffect(() => {
    socket.on('new_message', updateMessages)
    return () => socket.off('new message')
  }, [ socket ]);

  const sendMessage = () => {
    let reply_id = selectedMessage["id"];
    if (text === '') return;
    let messageObj;
    if (server === 0) {
      messageObj = {
        message: text,
        server_id: null,
        channel_id: null,
        user_id: userId,
        recipient_id: channel,
        reply: reply_id,
      }
    } else {
      messageObj = {
        message: text,
        server_id: server,
        channel_id: channel,
        user_id: userId,
        recipient_id: 0,
        reply: reply_id,
      }
    }

    socket.emit('message', messageObj);
    setText('');
    closeEdit();
  };

  const formatTimeAgo = (timestamp) => {
    const time = moment(parseInt(timestamp));
    const now = moment();
    if (time.isSame(now, 'day')) {
      return "Today " + time.format("h:mm A");
    } else if (time.isSame(now.subtract(1, 'days'), 'day')) {
      return "Yesterday " + time.format("h:mm A");
    } else {
      return time.format("MM/DD/YYYY h:mm A");
    }
    }

  const closeEdit = () => {
    setSelectedMessage({id: 0});
    setReplyEdits(false);
  }

  const handleTextChange = (input) => {
    setText(input);
    if (input.length > 0) {
      setShowButton(true);
    } else {
      setShowButton(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#36393e'}} behavior={Platform.OS === 'ios' ? 'padding' : ''}>
       <SafeAreaView style={SafeViewAndroid.AndroidSafeArea}>
          <Text style={styles.chatTitle}>{server === 0 ? '@ ' + (channelName || 'Add Friends to start a DM') : '# ' + channelName}</Text>
          <SelectUsersModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectedUser={selectedUser}
            currentScreen="userList"
          />
          {/* <View style={styles.textArea}> */}
            <FlatList
              style={{...styles.textSpace, marginHorizontal: 16}}
              inverted
              data={[...messages].reverse()}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item }) => (
                <TouchableWithoutFeedback
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    setSelectedUser(item);
                  }}
                  onLongPress={() => {
                    setReplyEdits(false)
                    setSelectedMessage(item)
                    setHoldModalVisible(true);
                  }}
                >
                  <View>
              {item.reply ? (<Text style={styles.replyMessage} ellipsizeMode='tail' numberOfLines={2}>{`Reply to ${messages.find(message => message.id === item.reply)?.username}: ${messages.find(message => message.id === item.reply)?.message}`}</Text>) : null}
                <View style={(selectedMessage.id === item.id && replyEdits) ? styles.selectedMessageContainer : styles.messageContainer}>
                      <Image style={styles.profilePicture} source={{uri: 'https://www.personality-insights.com/wp-content/uploads/2017/12/default-profile-pic-e1513291410505.jpg'}}></Image>
                      <View style={styles.textContainer}>
                        <View style={styles.topLine}>
                          <Text style={styles.username}>{item.username}</Text>
                          <Text style={styles.timestamp}>{formatTimeAgo(item.created_at)}</Text>
                        </View>
                        <Text style={styles.messageLine}>{item.message}</Text>
                </View>
                      </View>
                  </View>
                </TouchableWithoutFeedback>
              )}
            />
          {/* </View> */}
            {replyEdits &&
              <View style={styles.editBarContainer}>
                <Pressable onPress={() => closeEdit()}>
                  <Text style={styles.exit} >X</Text>
                </Pressable>
                <View style={styles.editBar}>
                  <Text style={styles.reply}>{`Replying to ${selectedMessage.username}`}</Text>
                </View>
              </View>
            }
          <View style={text.length === 0 ? styles.bottomBar : styles.bottomBar2}>
            {channel !== undefined && <TextInput
              style={ text.length === 0 ? styles.chatBar : styles.chatBar2 }
              value={text}
              onChangeText={handleTextChange}
              placeholder="Type a message..."
              placeholderTextColor="#71757c"
              />}
              {showButton && (
                <TouchableOpacity onPress={sendMessage}>
                  <View style={styles.sendButton}>
                    <Text style={styles.send}>></Text>
                  </View>
                </TouchableOpacity>
              )}
          </View>
          <HoldMessageModal
            holdModalVisible={holdModalVisible}
            setHoldModalVisible={setHoldModalVisible}
            setReplyEdits={setReplyEdits}
          />
        </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const LeftDrawerContent = ({getServers, servers, setServer, server, setChannel, channel, channelName, setChannelName, setUserList, navigation, setServers}) => {
  const userId = React.useContext(UserId);

  const [serverName, setServerName] = useState('');
  const [inviteModal, setInviteModal] = useState(false);
  const [createChannelModal, setCreateChannelModal] = useState(false);
  const [channelModal, setChannelModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [channels, setChannels] = useState([])
  const [refreshing, setRefreshing] = useState(false);
  const [serverAdmin, setServerAdmin] = useState();

  useEffect(() => {
    loadDms(userId);
  }, [])

  const loadChannels = (server) => {
    axios.get(`http://${Constants.manifest?.extra?.apiUrl}/channels/${server.id}`)
      .then(response => {
        setServerAdmin(server.admin_id);
        setChannels(response.data);
        setServer(server.id);
        setChannel(response.data[0].id)
        setChannelName(response.data[0].channel_name)
        setServerName(server.server_name)
        axios.get(`http://${Constants.manifest?.extra?.apiUrl}/server/${server.id}/users`)
          .then(response => {
            setUserList(response.data);
          })
          .catch(error => {
            console.log('Error getting users in server ', error.message);
          });
      })
      .catch(error => {
        console.log('Error getting channels ', error.message);
      });
  }

  const loadChannel = (channel, user_id) => {
    if (user_id && user_id < channel.id) {
      socket.emit('join_channel', `DMs ${user_id}${channel.id}` )
    } else if (user_id && user_id > channel.id) {
      socket.emit('join_channel', `DMs ${channel.id}${user_id}`)
    } else {
      socket.emit('join_channel', channel.id)
    }
    setChannel(channel.id)
    if (user_id) {
      setChannelName(channel.username)
    } else {
      setChannelName(channel.channel_name)
    }
    navigation.getParent('LeftDrawer').closeDrawer()
  }

  const longPressChannel = (channel) => {
    if(serverAdmin === userId) {
      setChannelModal(!channelModal)
      setChannelName(channel.channel_name)
      setChannel(channel.id)
    }
  }

  const loadDms = (id) => {
    axios.get(`http://${Constants.manifest?.extra?.apiUrl}/friends/${id}`)
      .then(response => {
        setChannels(response.data);
        setServer(0);
        setChannel(response.data[0]?.id)
        setChannelName(response.data[0]?.username)
        setUserList([])
        setServerName('Direct Messages')
      })
      .catch(error => {
        console.log('Error getting friends ', error.message);
      });
  }


  const makeServerIcon = (serverName) => {
    let splitServerName = serverName.split(' ')
    if (splitServerName.length > 1) {
      return `${splitServerName[0].slice(0,1)}${splitServerName[1].slice(0,1)}`
    }
    return serverName.slice(0,1)
  }

  const onRefresh = () => {
    setRefreshing(true);
    axios.get(`http://${Constants.manifest?.extra?.apiUrl}/servers/${userId}`)
    .then(response => {
      setServers(response.data);
      setRefreshing(false);
      axios.get(`http://${Constants.manifest?.extra?.apiUrl}/channels/${server}`)
        .then((response) => {
          setChannels(response.data);
        })
        .catch((error) => {
          console.log('Error refreshing channels', error.message)
        })
    })
    .catch(error => {
      console.log('Error getting servers ', error.message);
    });
  };

  return (
    <ScrollView
      progressViewOffset={8}
      refreshControl={
      <RefreshControl refreshing={refreshing}
      onRefresh={onRefresh} />
    }>
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <ChannelModal
          channelModal={channelModal}
          setChannelModal={setChannelModal}
          channelName={channelName}
          channel={channel}
        />
        {/* server side bar */}
        <SafeAreaView style={{...SafeViewAndroid.AndroidSafeArea, flex: 1}}>
          <View style={styles.serverArea}>
            <Pressable key={1} style={(serverName === 'Direct Messages') ? {...styles.server, backgroundColor: '#6246DB'} : styles.server} onPress={() => loadDms(userId)}>
              <Text style={styles.title}>{makeServerIcon('Direct Messages')}</Text>
            </Pressable>
            {servers.map((server) => {
              return (<Pressable key={server.id} style={(serverName === server.server_name) ? {...styles.server, backgroundColor: '#6246DB'} : styles.server} onPress={() => loadChannels(server)}>
                <Text style={styles.title}>{makeServerIcon(server.server_name)}</Text>
              </Pressable>)
            })}
            <Pressable style={styles.server} onPress={() => setModalVisible(true)}>
              <Text style={styles.title}>+</Text>
            </Pressable>
          </View>
          <CreateServerModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            userId={userId}
            getServers={getServers}
          />
        </SafeAreaView>
        {/* channel area  */}
        <SafeAreaView style={{...SafeViewAndroid.AndroidSafeArea, flex: 4, marginHorizontal: 4}}>
          <View style={styles.channelArea}>
            <View style={styles.titleAddUser}>
              <Text style={styles.serverHeader}>{serverName}</Text>
              {server !== 0 ? <TouchableOpacity style={{paddingTop: 5}}onPress={() => setInviteModal(true)}>
                  <AntDesign name="adduser" size={20} color="white" />
              </TouchableOpacity> : null}
            </View>
            <InviteUserModal
              inviteModal={inviteModal}
              setInviteModal={setInviteModal}
              server={server}
              setUserList={setUserList}
            />
            {server === 0
              ? (
                channels.map((friend) => {
                  return (<Pressable key={friend.id} style={({pressed}) => [
                    {
                      backgroundColor: pressed ? '#494d54' : '#222326',
                    },
                    styles.item,
                  ]} onPress={() => loadChannel(friend, userId)}>
                    <Text style={styles.title}>{`@ ${friend.username}`}</Text>
                  </Pressable>)
                })
              )
              : (
                channels.map((channel) => {
                  return (<Pressable key={channel.id} style={({pressed}) => [
                    {
                      backgroundColor: pressed ? '#494d54' : '#222326',
                    },
                    styles.item,
                  ]} onPress={() => loadChannel(channel)} onLongPress={() => longPressChannel(channel)}>
                    <Text style={styles.title}>{`# ${channel.channel_name}`}</Text>
                  </Pressable>)
                })
              )
            }
            {server !== 0 ? <TouchableOpacity style={styles.inviteButton} onPress={() => setCreateChannelModal(true)}>
            <Text>
              Add Channel
            </Text>
          </TouchableOpacity> : null}
          <CreateChannelModal
            createChannelModal={createChannelModal}
            setCreateChannelModal={setCreateChannelModal}
            server={server}
            loadChannels={loadChannels}
          />
        </View>

          {/* {channels.map((channel) => {
            return (<Pressable key={channel.id} style={styles.item} onPress={() => loadChannel(channel.id)}>
              <Text style={styles.title}>{channel.channel_name}</Text>
            </Pressable>)
          })} */}
        </SafeAreaView>
      </View>
    </ScrollView>
  );
}

const RightDrawerContent = ({userList, channelName, server}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const onlineUsers = [];
  const offlineUsers = [];
  userList.forEach((user) => {
    if (user.online) onlineUsers.push({
      id: user.id,
      username: user.username,
    })
    else if (!user.online) offlineUsers.push({
      id: user.id,
      username: user.username,
    })
  })
  const DATA = [
    {
      title: 'Online',
      data: onlineUsers,
    },
    {
      title: 'Offline',
      data: offlineUsers,
    },
  ];
  return (
    <View style={{display: 'flex', flex: 1, alignItems: 'flex-start', ...padding(10, 30, 10, 10)}}>
      <SafeAreaView style={{...SafeViewAndroid.AndroidSafeArea, flex: 1}}>
        <SelectUsersModal
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            selectedUser={selectedUser}
            currentScreen="userList"
        />
        <View style={styles.topBar}>
          <Text style={styles.topBarText}>
            {channelName}
          </Text>
        </View>
        {server !== 0
          ? (
            <SectionList
              sections={DATA}
              keyExtractor={(item, index) => item + index}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    setSelectedUser(item);
                  }}
                >
                    <Text style={styles.title}>{item.username}</Text>
                  </TouchableOpacity>
              )}
              renderSectionHeader={({section: {title, data}}) => (
                <Text style={styles.header}>{title} - {data.length}</Text>
              )}
            />
          ) : null
        }
      </SafeAreaView>
    </View>
  );
}

const LeftDrawerScreen = ({setDrawerStatus, navigation}) => {
  const userId = React.useContext(UserId);

  const [servers, setServers] = useState([])
  const [server, setServer] = useState(0)
  const [channel, setChannel] = useState(0)
  const [channelName, setChannelName] = useState('')
  const [userList, setUserList] = useState([])
  useEffect(() => {
    getServers()
  }, [])

  const getServers = () => {
    axios.get(`http://${Constants.manifest?.extra?.apiUrl}/servers/${userId}`)
    .then(response => {
      setServers(response.data);
    })
    .catch(error => {
      console.log('Error getting servers ', error.message);
    });
  };

  return (
    <LeftDrawer.Navigator
      id="LeftDrawer"
      defaultStatus="open"
      drawerContent={(props) => <LeftDrawerContent {...props} getServers={getServers} servers={servers} setServer={setServer} server={server} setChannel={setChannel} channel={channel} channelName={channelName} setChannelName={setChannelName} setUserList={setUserList} setServers={setServers} />}
      screenOptions={{
        drawerPosition: 'left',
        drawerType: 'back',
        swipeEnabled: true,
        swipeEdgeWidth: width/2,
        headerShown: false,
        drawerStyle: {
          width: '90%',
          backgroundColor: '#36393e',
        }
      }}>
      <LeftDrawer.Screen name="Channel">
        {(props) => <RightDrawerScreen {...props} server={server} channel={channel} channelName={channelName} userList={userList} setDrawerStatus={setDrawerStatus} />}
      </LeftDrawer.Screen>
    </LeftDrawer.Navigator>
  );
}

const RightDrawerScreen = ({server, channel, userList, setDrawerStatus, channelName}) => {
  const drawerStatus = useDrawerStatus();
  useEffect(() => {
    setDrawerStatus(drawerStatus === 'open')
  }, [drawerStatus])

  return (
    <RightDrawer.Navigator
      id="RightDrawer"
      drawerContent={(props) => <RightDrawerContent {...props} userList={userList} channelName={channelName} server={server} />}
      screenOptions={{
        drawerPosition: 'right',
        headerShown: false,
        drawerType: 'back',
        swipeEnabled: true,
        swipeEdgeWidth: width/2,
        drawerStyle: {
          width: '85%',
          backgroundColor: '#36393e',
        }
      }}>
      <RightDrawer.Screen name="HomeDrawer">
        {(props) => <ChatScreen {...props} server={server} channel={channel} channelName={channelName} />}
      </RightDrawer.Screen>
    </RightDrawer.Navigator>
  );
}

const MainPage = ({ navigation, setDrawerStatus, friends }) => {
  return (
    <LeftDrawerScreen setDrawerStatus={setDrawerStatus} navigation={navigation} />
  );
};

const padding = function (a, b, c, d) {
  return {
    paddingTop: a,
    paddingRight: b ? b : a,
    paddingBottom: c ? c : a,
    paddingLeft: d ? d : (b ? b : a)
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#36393e',
    flex: 1,
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
    marginHorizontal: 16,
  },
  item: {
    padding: 5,
  },
  header: {
    fontSize: 20,
    color: '#fff',
    padding: 5,
    backgroundColor: '#36393e',
  },
  title: {
    fontSize: 16,
    color: '#fff',
  },
  messageLine: {
    color: '#d5d6d6',
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 10,
    padding: 10,
  },
  messageContainer: {
    padding: 5,
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  chatTitle: {
    color: 'white',
    marginTop: 10,
    marginLeft: 20,
    fontSize: 20
  },
  textSpace: {
    margin: 10,
    ...padding(10, 30, 10, 10),
    backgroundColor: '#222326',
    borderRadius: 10
  },
  textContainer: {
    flexDirection: 'column',
    paddingHorizontal: 10,
  },
  username: {
    color: '#A1A8F4',
    fontWeight: 'bold',
  },
  topLine: {
    flexDirection: 'row',
  },
  timestamp: {
    color: '#71757c',
    paddingHorizontal: 14,
    fontSize: 12,
  },
  // server stuff
  serverArea: {
    width: width*.20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  server: {
    width: width*.12,
    height: width*.12,
    borderRadius: width*.09,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    margin: width*.01,
    backgroundColor: '#5865f2',
  },
  // channel area in left drawer
  channelArea: {
    backgroundColor: '#222326',
    height: height,
    borderRadius: 10,
    ...padding(10),
    marginRight: 10,
    marginLeft: 7,
  },
  userItem: {
    padding: 10,
    justifyContent: 'center',
    fontSize: 14,
    height: 50,
    width: width / 1.25,
    borderBottomWidth: 1,
    borderColor: '#17181e',
    color: '#fff',
  },
  topBar: {
    backgroundColor: '#36393e',
    width,
    height: 60,
    display: 'flex',
    alignItems: 'flex-start',
    marginLeft: width / 4,
    paddingBottom: 20,
    justifyContent: 'flex-end',
  },
  topBarText: {
    fontSize: 20,
    color: '#fff',
  },
  editBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#2f3135',
    width: width,
    paddingHorizontal: 30,
    marginTop: 10,
  },
  editBar: {
    backgroundColor: '#2f3135',
    padding: 10,
  },
  exit: {
    backgroundColor: '#2f3135',
    color: '#abadb0',
    padding: 3,
  },
  reply: {
    color: '#abadb0',
  },
  selectedMessageContainer: {
    padding: 5,
    flexDirection: 'row',
    backgroundColor: '#3d414d',
    width: width,
  },
  sendButton: {
    overflow: 'hidden',
    borderRadius: 30,
    justifyContent: 'center',
    marginBottom: 10,
    marginRight: 20,
  },
  send: {
    color: 'white',
    backgroundColor: '#5864f1',
    height: 33,
    width: 33,
    textAlign: 'center',
    fontWeight: 'bold',
    paddingTop: 7,
  },
  bottomBar: {
    width: width,
    flexDirection: 'row',
  },
  bottomBar2: {
    width: width,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  chatBar: {
    backgroundColor: '#292b2f',
    height: 40,
    width: width,
    borderRadius: 30,
    paddingHorizontal: 20,
    // color: '#71757c',
    color: '#fff',
    marginHorizontal: 20,
    marginBottom: 10,
    width: width*.9
  },
  chatBar2: {
    backgroundColor: '#292b2f',
    height: 40,
    width: width * .88,
    borderRadius: 30,
    paddingHorizontal: 20,
    color: '#fff',
    marginRight: 10,
    marginLeft: 20,
    marginBottom: 10,
    width: width*.8
  },
  serverHeader: {
    fontSize: 20,
    color: '#fff',
    marginTop: 2,
    marginBottom: 10
  },
  inviteButton: {
    backgroundColor: '#5865f2',
    justifyContent:'center',
    alignItems: 'center',
    height: 24,
    marginVertical: 10,
    borderRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  replyMessage: {
    color: 'white',
    marginHorizontal: 45,
    marginTop: 10,
  },
  titleAddUser: {
    flexDirection: "row",
    justifyContent: 'space-between',
  }
});

export default MainPage;