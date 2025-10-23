import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native'

export default function SettingsScreen({ navigation }) {
  const showComingSoon = () => {
    Alert.alert('Coming Soon', 'This feature is under development')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>New Matches</Text>
            <Switch
              value={true}
              onValueChange={showComingSoon}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>New Messages</Text>
            <Switch
              value={true}
              onValueChange={showComingSoon}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Blocked Users</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Report a Problem</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => Alert.alert('Delete Account', 'Are you sure? This action cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: showComingSoon },
          ])}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  settingArrow: {
    fontSize: 24,
    color: '#CCC',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
