import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const CustomBottomSheet = ({
    visible,
    onClose,
    title,
    message,
    buttons = []
}) => {

    const handleClose = () => {
        if (onClose) onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.content}>
                        {title && <Text style={styles.title}>{title}</Text>}
                        {message && <Text style={styles.message}>{message}</Text>}

                        <View style={styles.buttonContainer}>
                            {buttons.length > 0 ? (
                                buttons.map((btn, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.button,
                                            btn.style === 'cancel' ? styles.cancelButton : styles.confirmButton,
                                            // Add margin if there are multiple buttons
                                            buttons.length > 1 && index < buttons.length - 1 && { marginBottom: 10 }
                                        ]}
                                        onPress={() => {
                                            if (btn.onPress) btn.onPress();
                                            handleClose();
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                btn.style === 'cancel' ? styles.cancelButtonText : styles.confirmButtonText
                                            ]}
                                        >
                                            {btn.text || 'OK'}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <TouchableOpacity
                                    style={[styles.button, styles.confirmButton]}
                                    onPress={handleClose}
                                >
                                    <Text style={[styles.buttonText, styles.confirmButtonText]}>OK</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        backgroundColor: '#2A2A2A',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    content: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',

    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#CCCCCC',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'column',
        gap: 12,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    confirmButton: {
        backgroundColor: '#FF6B6B',
    },
    cancelButton: {
        backgroundColor: '#333333',
        borderWidth: 1,
        borderColor: '#444',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButtonText: {
        color: '#FFFFFF',
    },
    cancelButtonText: {
        color: '#FFFFFF',
    },
});

export default CustomBottomSheet;
