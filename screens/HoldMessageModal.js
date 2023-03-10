import React, { useState } from 'react';
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
  TextInput,
  Button,
} from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  modalOverlay: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    display: 'flex',
    backgroundColor: '#36393e',
    borderRadiusTop: 20,
    height: height * .3,
    padding: 10,
    width,
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
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
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
    height: height,
  },
  input: {
    padding: 10,
    fontSize: 18,
    borderRadius: 6,
    width: width * .8,
    marginBottom: 20,
    backgroundColor: '#202225',
    color: '#fff'
  },
  button: {
    width: width * .8,
    height: 35,
    backgroundColor: '#5865f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#ececec',
  },
  subheader: {
    color: '#71757c'
  },
  replybutton: {
    backgroundColor: '#5865f2',
    justifyContent:'center',
    alignItems: 'center',
    height: 30,
    marginVertical: 10,
    borderRadius: 5,
    width: width * .8,
  },
});

function HoldMessageModal({holdModalVisible, setHoldModalVisible, setReplyEdits}) {


  const handleReply = () => {
    console.log("Handling Reply")
    setReplyEdits(true)
    setHoldModalVisible(false)
  }

  return !holdModalVisible ? null : (
    <Modal
      animationType="fade"
      transparent
      visible={holdModalVisible}
      onRequestClose={() => {
        setHoldModalVisible(!holdModalVisible)
      }}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={() => {
          setHoldModalVisible(!holdModalVisible)
        }}
      >
        <ScrollView
          directionalLockEnabled
          // centerContent={true}
          contentInset={{
            top: height, left: 0, bottom: 0, right: 0,
          }}
          onScrollEndDrag={() => setHoldModalVisible(!holdModalVisible)}
        >
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Options</Text>
                <Pressable style={styles.replybutton} onPress={() => handleReply()}>
                  <Text>Reply</Text>
                </Pressable>
                {/* <Pressable onPress={() => handleCreateServer()}>
                  <Text style={styles.buttonText}>DM</Text>
                </Pressable> */}
              </View>
        </ScrollView>
      </TouchableOpacity>
    </Modal>
  );
}

export default HoldMessageModal;
