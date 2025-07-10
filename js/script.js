class TodoApp {
    constructor() {
        // Inisialisasi array tugas kosong, filter saat ini, dan ID tugas yang sedang diedit
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.isEditMode = false;

        // Panggil fungsi inisialisasi aplikasi
        this.init();
    }

    init() {
        // Muat tugas dari localStorage dan bind event-event DOM
        this.loadTasks();
        this.bindEvents();
        this.render(); // Tampilkan daftar tugas
    }

    bindEvents() {
        // Event saat tombol "Add/Save" diklik
        document.getElementById('addBtn').addEventListener('click', () => {
            if (this.isEditMode) {
                this.saveInlineEdit();
            } else {
                this.addTask();
            }
        });

        // Event saat user menekan Enter di input
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (this.isEditMode) {
                    this.saveInlineEdit();
                } else {
                    this.addTask();
                }
            }
        });

        // Event saat user mengubah filter (all/pending/completed)
        document.getElementById('filterSelect').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.render(); // Tampilkan ulang tugas yang sesuai filter
        });

        // Event saat tombol "Delete All" diklik
        document.getElementById('deleteAllBtn').addEventListener('click', () => this.deleteAllTasks());

        // Event tombol batal edit inline
        document.getElementById('cancelEditInline').addEventListener('click', () => this.cancelInlineEdit());
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const dateInput = document.getElementById('dateInput');

        const taskText = taskInput.value.trim(); // Hilangkan spasi
        const dueDate = dateInput.value;

        if (!taskText) {
            this.showAlert('Please enter a task!', 'warning');
            return;
        }

        // Buat objek tugas baru
        const task = {
            id: Date.now(), // Gunakan timestamp sebagai ID unik
            text: taskText,
            dueDate: dueDate || null,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Simpan ke array dan localStorage
        this.tasks.push(task);
        this.saveTasks();
        this.render(); // Refresh tampilan

        // Kosongkan input setelah menambah
        taskInput.value = '';
        dateInput.value = '';

        this.showAlert('Task added successfully!', 'success');
    }

    deleteTask(id) {
        // Konfirmasi sebelum menghapus
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id); // Hapus berdasarkan ID
            this.saveTasks();
            this.render();
            this.showAlert('Task deleted!', 'info');
        }
    }

    toggleTaskStatus(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            // Toggle status antara 'pending' dan 'completed'
            task.status = task.status === 'pending' ? 'completed' : 'pending';
            this.saveTasks();
            this.render();
            this.showAlert(`Task marked as ${task.status}!`, 'success');
        }
    }

    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            // Masuk ke mode edit
            this.isEditMode = true;
            this.editingTaskId = id;

            // Isi input dengan data tugas yang akan diedit
            document.getElementById('taskInput').value = task.text;
            document.getElementById('dateInput').value = task.dueDate || '';

            // Ubah tombol + menjadi centang
            const addBtn = document.getElementById('addBtn');
            addBtn.innerHTML = '<i class="bx bx-check text-xl"></i>';
            addBtn.classList.remove('btn-primary');
            addBtn.classList.add('btn-success');

            // Tampilkan notifikasi edit mode
            document.getElementById('editNotification').classList.remove('hidden');

            // Focus pada input
            document.getElementById('taskInput').focus();
        }
    }

    saveInlineEdit() {
        const taskInput = document.getElementById('taskInput');
        const dateInput = document.getElementById('dateInput');
        
        const taskText = taskInput.value.trim();
        const dueDate = dateInput.value;

        if (!taskText) {
            this.showAlert('Please enter a task!', 'warning');
            return;
        }

        const task = this.tasks.find(task => task.id === this.editingTaskId);
        if (task) {
            // Simpan perubahan ke tugas
            task.text = taskText;
            task.dueDate = dueDate || null;
            this.saveTasks();
            this.render();
            this.exitEditMode();
            this.showAlert('Task updated!', 'success');
        }
    }

    cancelInlineEdit() {
        // Kosongkan input dan keluar dari mode edit
        document.getElementById('taskInput').value = '';
        document.getElementById('dateInput').value = '';
        this.exitEditMode();
        this.showAlert('Edit cancelled', 'info');
    }

    exitEditMode() {
        // Keluar dari mode edit
        this.isEditMode = false;
        this.editingTaskId = null;

        // Kembalikan tombol ke bentuk semula
        const addBtn = document.getElementById('addBtn');
        addBtn.innerHTML = '<i class="bx bx-plus text-xl"></i>';
        addBtn.classList.remove('btn-success');
        addBtn.classList.add('btn-primary');

        // Sembunyikan notifikasi edit mode
        document.getElementById('editNotification').classList.add('hidden');
    }

    deleteAllTasks() {
        if (this.tasks.length === 0) {
            this.showAlert('No tasks to delete!', 'info');
            return;
        }

        // Konfirmasi hapus semua tugas
        if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            this.showAlert('All tasks deleted!', 'info');
        }
    }

    getFilteredTasks() {
        // Kembalikan daftar tugas berdasarkan filter aktif
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => task.status === 'pending');
            case 'completed':
                return this.tasks.filter(task => task.status === 'completed');
            default:
                return this.tasks;
        }
    }

    formatDate(dateString) {
        // Ubah format tanggal menjadi MM/DD/YYYY
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    isOverdue(dateString) {
        // Cek apakah tanggal sudah lewat (overdue)
        if (!dateString) return false;
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Hanya periksa tanggal, bukan jam
        return dueDate < today;
    }

    render() {
        const tbody = document.getElementById('taskTableBody');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        // Jika tidak ada tugas yang sesuai, tampilkan empty state
        if (filteredTasks.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        // Render setiap baris tugas ke dalam tabel
        tbody.innerHTML = filteredTasks.map(task => {
            const isOverdue = this.isOverdue(task.dueDate) && task.status === 'pending';
            const isBeingEdited = this.isEditMode && this.editingTaskId === task.id;

            // Tentukan lencana status
            const statusBadge = task.status === 'completed' 
                ? '<span class="badge badge-success">Completed</span>'
                : isOverdue 
                    ? '<span class="badge badge-error">Overdue</span>'
                    : '<span class="badge badge-warning">Pending</span>';

            return `
                <tr class="${task.status === 'completed' ? 'opacity-60' : ''}">
                    <td class="${task.status === 'completed' ? 'line-through' : ''}">${task.text}</td>
                    <td class="${isOverdue ? 'text-error' : ''}">${this.formatDate(task.dueDate)}</td>
                    <td>${statusBadge}</td>
                    <td class="flex gap-2">
                        <button class="btn btn-sm btn-info text-white" 
                                title="Edit" 
                                onclick="app.editTask(${task.id})">
                            <i class='bx bx-edit-alt'></i>
                        </button>
                        <button class="btn btn-sm ${task.status === 'completed' ? 'btn-warning' : 'btn-success'} text-white" 
                                title="${task.status === 'completed' ? 'Mark as Pending' : 'Mark as Complete'}"
                                onclick="app.toggleTaskStatus(${task.id})">
                            <i class='bx ${task.status === 'completed' ? 'bx-undo' : 'bx-check'}'></i>
                        </button>
                        <button class="btn btn-sm btn-error text-white" 
                                title="Delete" 
                                onclick="app.deleteTask(${task.id})">
                            <i class='bx bx-trash'></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    showAlert(message, type = 'info') {
        // Tampilkan notifikasi sederhana
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} fixed top-4 right-4 w-auto max-w-sm z-50 shadow-lg`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class='bx ${type === 'success' ? 'bx-check-circle' : type === 'warning' ? 'bx-error' : type === 'error' ? 'bx-x-circle' : 'bx-info-circle'} text-lg mr-2'></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Hapus notifikasi setelah 3 detik
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    saveTasks() {
        // Simpan data ke localStorage
        const tasks = JSON.stringify(this.tasks);
        // Simulasi localStorage dengan variabel global
        if (typeof window !== 'undefined') {
            window.todoTasksData = tasks;
        }
    }

    loadTasks() {
        // Ambil data dari localStorage simulasi
        if (typeof window !== 'undefined' && window.todoTasksData) {
            try {
                this.tasks = JSON.parse(window.todoTasksData);
            } catch (e) {
                console.warn('Could not load tasks');
                this.tasks = [];
            }
        } else {
            this.tasks = [];
        }
    }
}

// Jalankan aplikasi saat DOM sudah siap
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TodoApp();
});