import React from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
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
import { UserId } from '../utils/hooks/context'

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    display: 'flex',
    backgroundColor: '#36393e',
    borderRadiusTop: 20,
    height: 300,
    padding: 20,
    width,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
    borderTopWidth: 1,
    borderColor: '#fff',
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginBottom: 15,
    justifyContent: 'center',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  buttonInteractive: {
    height: 100,
    margin: 10,
    backgroundColor: '#5865f2',
    borderWidth: 1,
    borderColor: '#fff',
    flex: 1,
  },
  buttonClose: {
    margin: 10,
    backgroundColor: '#17181e',
    width: width / 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#fff',
  },
  modalTitle: {
    fontSize: 28,
    marginBottom: 15,
    textAlign: 'center',
    color: '#fff',
  },
  scrollModal: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    height: height / 2,
  },
});

const addFriend = (user_id, friend_id) => {
  axios.post(`http://${Constants.expoConfig.extra.apiUrl}/friends`, { user_id, friend_id })
    .then(() => {
      console.log('succesfully added friend');
    })
    .catch((err) => {
      console.log('Error adding friend', err);
    });
};

const removeFriend = (user_id, friend_id) => {
  axios.delete(`http://${Constants.expoConfig.extra.apiUrl}/friends`, { data: { user_id, friend_id }})
    .then(() => {
      console.log('succesfully removed friend');
    })
    .catch((err) => {
      console.log('Error adding friend', err);
    });
};

function SelectUsersModal({
  modalVisible, setModalVisible, selectedUser, currentScreen,
  friendRemoved, setFriendRemoved,
}) {
  const userId = React.useContext(UserId);
  return !modalVisible ? null : (
    <Modal
      animationType="slide"
      transparent
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <ScrollView
          directionalLockEnabled
          // centerContent={true}
          contentInset={{
            top: height, left: 0, bottom: 0, right: 0,
          }}
          onScrollEndDrag={() => setModalVisible(!modalVisible)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                {selectedUser.username}
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonInteractive]}
                  onPress={() => console.log('clicked')}
                >
                  <Text style={styles.textStyle}>Send Message</Text>
                </TouchableOpacity>
                {currentScreen === 'friendsList'
                  ? (
                    <TouchableOpacity
                      style={[styles.button, styles.buttonInteractive]}
                      onPress={() => {
                        removeFriend(userId, selectedUser.id);
                        setFriendRemoved(!friendRemoved);
                        setModalVisible(!modalVisible);
                      }}
                    >
                      <Text style={styles.textStyle}>Remove Friend</Text>
                    </TouchableOpacity>
                  )
                  : (
                    <TouchableOpacity
                      style={[styles.button, styles.buttonInteractive]}
                      onPress={() => addFriend(userId, selectedUser.id)}
                    >
                      <Text style={styles.textStyle}>Add Friend</Text>
                    </TouchableOpacity>
                  )}

              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </TouchableOpacity>
    </Modal>
  );
}

export default SelectUsersModal;
