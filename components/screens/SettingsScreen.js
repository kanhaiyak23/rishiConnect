import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { signOut } from '../redux/slices/authSlice'
import { Ionicons } from '@expo/vector-icons'
import { useBottomSheet } from '../../context/BottomSheetContext'

export default function SettingsScreen({ navigation }) {
  const dispatch = useDispatch()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const { showBottomSheet } = useBottomSheet()


  const handleLogout = async () => {
    console.log('Logging out...')
    setShowLogoutModal(false)
    await dispatch(signOut())
    console.log('Logged out successfully')
  }

  const settingsOptions = [
    { icon: 'options-outline', label: 'Discovery Preferences' },
    { icon: 'person-outline', label: 'Profile & Privacy' },
    { icon: 'notifications-outline', label: 'Notification' },
    { icon: 'shield-checkmark-outline', label: 'Account & Security' },
    { icon: 'card-outline', label: 'Subscription' },
    { icon: 'color-palette-outline', label: 'App Appearance' },
    { icon: 'link-outline', label: 'Third Party Integrations' },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Membership Banner */}
        <TouchableOpacity
          style={styles.membershipBanner}
          onPress={() =>
            showBottomSheet(
              "Membership Feature",
              "Premium membership features will be added soon! You'll get exclusive perks, priority matching, and more.",
              [
                {
                  text: "OK",
                  style: "confirm",
                }
              ]
            )
          }
        >
          <View style={styles.membershipIcon}>
            <View style={styles.membershipIconInner} />
          </View>

          <View style={styles.membershipText}>
            <Text style={styles.membershipTitle}>Upgrade Membership Now!</Text>
            <Text style={styles.membershipSubtitle}>Get exclusive features and benefits</Text>
          </View>

          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>


        {/* Settings Options */}
        <View style={styles.settingsList}>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingItem}
              onPress={() =>
                showBottomSheet(
                  "Feature Not Available",
                  `"${option.label}" is coming soon. Stay tuned for updates!`,
                  [
                    {
                      text: "OK",
                      style: "confirm",
                    }
                  ]
                )
              }
            >
              <Ionicons name={option.icon} size={24} color="#FFFFFF" style={styles.settingIcon} />
              <Text style={styles.settingLabel}>{option.label}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
          <View style={styles.logoutSpacer} />
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModal}>
            <Text style={styles.logoutModalTitle}>Logout</Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.logoutCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutConfirmText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 16,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  membershipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  membershipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  membershipIconInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9500',
  },
  membershipText: {
    flex: 1,
  },
  membershipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  membershipSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  settingsList: {
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    gap: 16,
  },
  settingIcon: {
    marginRight: 4,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 32,
    gap: 12,
  },
  logoutIcon: {
    marginRight: 4,
  },
  logoutButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  logoutSpacer: {
    width: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  logoutModal: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  logoutModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 16,
    textAlign: 'center',
  },
  logoutModalMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  logoutCancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutConfirmButton: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
