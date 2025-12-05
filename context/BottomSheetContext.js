import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomBottomSheet from '../components/ui/CustomBottomSheet';

const BottomSheetContext = createContext();

export const useBottomSheet = () => {
    const context = useContext(BottomSheetContext);
    if (!context) {
        throw new Error('useBottomSheet must be used within a BottomSheetProvider');
    }
    return context;
};

export const BottomSheetProvider = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        buttons: [],
    });

    const showBottomSheet = useCallback((title, message, buttons = []) => {
        setConfig({ title, message, buttons });
        setIsVisible(true);
    }, []);

    const hideBottomSheet = useCallback(() => {
        setIsVisible(false);
    }, []);

    return (
        <BottomSheetContext.Provider value={{ showBottomSheet, hideBottomSheet }}>
            {children}
            <CustomBottomSheet
                visible={isVisible}
                onClose={hideBottomSheet}
                title={config.title}
                message={config.message}
                buttons={config.buttons}
            />
        </BottomSheetContext.Provider>
    );
};
