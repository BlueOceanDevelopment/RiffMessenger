// eslint-disable-next-line import/no-unresolved
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
  SectionList,
  SafeAreaView,
  Modal,
  Pressable,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import axios from 'axios';
import Constants from 'expo-constants';
import SelectUsersModal from './SelectUsersModal';
import SafeViewAndroid from '../utils/hooks/SafeViewAndroid';

import InviteUserModal from './InviteUserModal';
import { UserId } from '../utils/hooks/context';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    backgroundColor: '#5865f2',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  item: {
    marginHorizontal: 20,
    padding: 10,
    justifyContent: 'center',
    fontSize: 14,
    height: 50,
    borderBottomWidth: 1,
    borderColor: '#17181e',
    color: '#fff',
  },
  header: {
    color: '#fff',
    fontSize: 22,
    padding: 10,
    width,
    backgroundColor: '#36393e',
    borderColor: '#17181e',
  },
  pageTitle: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
    marginTop: 10,
  },
  bottomText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 50,
    marginLeft: 30,
  },
  topBar: {
    backgroundColor: '#5865f2',
    width,
    height: 60,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: .5,
    borderColor: '#fff'
  },
  title: {
    fontSize: 16,
    color: '#fff',
  },
  addFriend: {
    fontSize: 36,
    fontWeight: 'bold',
    position: 'absolute',
    color: '#fff',
    top: -25,
    left: 100,
  },
  page: {
    backgroundColor: '#36393e',
    height,
  },
});

function FriendsPage({ route }) {
  const userId = React.useContext(UserId);
  const [addFriendModal, setAddFriendModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [friendRemoved, setFriendRemoved] = useState(false);
  const [friends, setFriends] = useState([{
    title: 'Online',
  },
  {
    title: 'Offline',
  },
  ]);
  useFocusEffect(
    React.useCallback(() => {
      axios.get(`http://${Constants.expoConfig.extra.apiUrl}/friends/${userId}`)// configure apiURL in .env
        .then((response) => {
          const offline = [];
          const online = [];
          for (let i = 0; i < response.data.length; i += 1) {
            if (response.data[i].online) {
              online.push({
                id: response.data[i].id,
                username: response.data[i].username,
              });
            } else {
              offline.push({
                id: response.data[i].id,
                username: response.data[i].username,
              });
            }
          }
          friends[1].data = offline;
          friends[0].data = online;
          setFriends([...friends]);
        })
        .catch((err) => {
          console.log('ERROR :', err.message);
        });
    }, [friendRemoved]),
  );
  // console.log('friends: ', friends);
  return !friends[0].data ? null : (
    <View style={styles.container}>
      <SafeAreaView style={{ ...SafeViewAndroid.AndroidSafeArea, flex: 1 }}>
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>Friends</Text>
          <TouchableOpacity><Text style={styles.addFriend} onPress={() => setAddFriendModal(!addFriendModal)}>+</Text></TouchableOpacity>
        </View>
        <View style={styles.page}>
        <InviteUserModal
          inviteModal={addFriendModal}
          setInviteModal={setAddFriendModal}
          server={userId}
          setUserList={setFriendRemoved}
          friendRemoved={friendRemoved}
          isFriendInvite
        />
        <SelectUsersModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          selectedUser={selectedUser}
          currentScreen="friendsList"
          friendRemoved={friendRemoved}
          setFriendRemoved={setFriendRemoved}
        />
        <SectionList
          sections={friends}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => {
                setModalVisible(!modalVisible);
                setSelectedUser(item);
              }}
            >
              <Text style={styles.title}>{item.username}</Text>
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title, data } }) => (
            <Text style={styles.header}>
              { title }
              {' - '}
              { data.length }
            </Text>
          )}
          stickySectionHeadersEnabled
        />
         </View>
      </SafeAreaView>
    </View>
  );
}

export default FriendsPage;
