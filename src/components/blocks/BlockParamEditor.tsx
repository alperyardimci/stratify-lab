import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { BlockDefinition, BlockParam } from '../../types';
import { theme } from '../../constants/theme';
import { Button, Input, Select } from '../common';

interface BlockParamEditorProps {
  definition: BlockDefinition;
  initialParams?: Record<string, any>;
  onSave: (params: Record<string, any>) => void;
  onCancel: () => void;
}

export const BlockParamEditor: React.FC<BlockParamEditorProps> = ({
  definition,
  initialParams = {},
  onSave,
  onCancel,
}) => {
  // Initialize params with defaults or initial values
  const [params, setParams] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    definition.params.forEach(param => {
      initial[param.name] = initialParams[param.name] ?? param.defaultValue ?? '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleParamChange = (name: string, value: any) => {
    setParams(prev => ({ ...prev, [name]: value }));
    // Clear error when value changes
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    definition.params.forEach(param => {
      if (param.required) {
        const value = params[param.name];
        if (value === undefined || value === null || value === '') {
          newErrors[param.name] = `${param.label} zorunludur`;
        }
      }

      if (param.type === 'number' && params[param.name] !== '') {
        const numValue = Number(params[param.name]);
        if (isNaN(numValue)) {
          newErrors[param.name] = 'Geçerli bir sayı giriniz';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      // Convert number params to actual numbers
      const processedParams: Record<string, any> = {};
      definition.params.forEach(param => {
        if (param.type === 'number') {
          processedParams[param.name] = Number(params[param.name]);
        } else {
          processedParams[param.name] = params[param.name];
        }
      });
      onSave(processedParams);
    }
  };

  const renderParam = (param: BlockParam) => {
    switch (param.type) {
      case 'number':
        return (
          <Input
            key={param.name}
            label={param.label}
            value={String(params[param.name] || '')}
            onChangeText={text => handleParamChange(param.name, text)}
            keyboardType="numeric"
            error={errors[param.name]}
          />
        );

      case 'string':
        return (
          <Input
            key={param.name}
            label={param.label}
            value={params[param.name] || ''}
            onChangeText={text => handleParamChange(param.name, text)}
            error={errors[param.name]}
          />
        );

      case 'select':
        return (
          <Select
            key={param.name}
            label={param.label}
            options={param.options || []}
            value={params[param.name]}
            onChange={value => handleParamChange(param.name, value)}
            error={errors[param.name]}
          />
        );

      case 'date':
        // For now, use text input for date
        // In production, use a date picker
        return (
          <Input
            key={param.name}
            label={param.label}
            value={params[param.name] || ''}
            onChangeText={text => handleParamChange(param.name, text)}
            placeholder="YYYY-MM-DD"
            error={errors[param.name]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Block Info */}
        <View style={styles.infoSection}>
          <View style={[styles.typeIndicator, { backgroundColor: definition.color }]}>
            <Text style={styles.typeText}>
              {definition.type.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.blockName}>{definition.label}</Text>
            <Text style={styles.blockDescription}>{definition.description}</Text>
          </View>
        </View>

        {/* Parameters */}
        <View style={styles.paramsSection}>
          <Text style={styles.sectionTitle}>Parametreler</Text>
          {definition.params.length === 0 ? (
            <Text style={styles.noParams}>Bu blok için parametre gerekmez</Text>
          ) : (
            definition.params.map(param => renderParam(param))
          )}
        </View>
      </ScrollView>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Iptal"
          onPress={onCancel}
          variant="outline"
          style={styles.cancelButton}
        />
        <Button
          title="Kaydet"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  typeText: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
  },
  infoContent: {
    flex: 1,
  },
  blockName: {
    color: theme.colors.text,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  blockDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  paramsSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  noParams: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  saveButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
});

export default BlockParamEditor;
