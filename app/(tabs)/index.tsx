import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { taskService, Task, CreateTaskData } from '../../services/taskService';
import { Ionicons } from '@expo/vector-icons';

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState<CreateTaskData>({
    title: '',
    description: '',
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = async () => {
    try {
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const task = await taskService.createTask(newTask);
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '' });
      setIsAddingTask(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleEditTask = async () => {
    if (!editingTask || !editingTask.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    try {
      const updatedTask = await taskService.updateTask(editingTask._id, {
        title: editingTask.title,
        description: editingTask.description,
      });
      setTasks(tasks.map((task) => 
        task._id === updatedTask._id ? updatedTask : task
      ));
      setEditingTask(null);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await taskService.deleteTask(taskId);
              setTasks(tasks.filter((task) => task._id !== taskId));
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete task');
            }
          },
        },
      ]
    );
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
      </View>
      <View style={styles.taskActions}>
        <TouchableOpacity
          onPress={() => setEditingTask(item)}
          style={styles.actionButton}
        >
          <Ionicons name="pencil-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteTask(item._id)}
          style={styles.actionButton}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {(isAddingTask || editingTask) ? (
        <View style={styles.taskForm}>
          <Text style={styles.formTitle}>
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={editingTask ? editingTask.title : newTask.title}
            onChangeText={(text) => {
              if (editingTask) {
                setEditingTask({ ...editingTask, title: text });
              } else {
                setNewTask({ ...newTask, title: text });
              }
            }}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description (optional)"
            value={editingTask ? editingTask.description : newTask.description}
            onChangeText={(text) => {
              if (editingTask) {
                setEditingTask({ ...editingTask, description: text });
              } else {
                setNewTask({ ...newTask, description: text });
              }
            }}
            multiline
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                setIsAddingTask(false);
                setEditingTask(null);
                setNewTask({ title: '', description: '' });
              }}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={editingTask ? handleEditTask : handleAddTask}
            >
              <Text style={styles.buttonText}>
                {editingTask ? 'Update Task' : 'Add Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingTask(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.buttonText}>Add New Task</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  taskForm: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
}); 