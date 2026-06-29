const fs = require('fs');
const filepath = 'src/app/super-admin/stores/page.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const importsToAdd = `
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Alert
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
`;

content = content.replace('} from "@mui/material";', '} from "@mui/material";' + importsToAdd);

const stateAndDialogCode = `
    const [openAdd, setOpenAdd] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        storeName: '',
        name: '',
        email: '',
        password: '',
        planId: '',
        billingCycle: 'monthly'
    });
    const [submitError, setSubmitError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get("/plans");
            setPlans(Array.isArray(response.data) ? response.data : response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch plans:", err);
        }
    };

    const handleAddSubmit = async () => {
        try {
            setSubmitting(true);
            setSubmitError('');
            await api.post("/subscriptions/manual-provision", formData);
            setOpenAdd(false);
            fetchStores();
            setFormData({ storeName: '', name: '', email: '', password: '', planId: '', billingCycle: 'monthly' });
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || err.message || 'Failed to create store');
        } finally {
            setSubmitting(false);
        }
    };
`;

content = content.replace('const fetchStores = async () => {', stateAndDialogCode + '\n    const fetchStores = async () => {');

const buttonCode = `
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Stores Management</Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddIcon />}
                    onClick={() => setOpenAdd(true)}
                >
                    Add Store
                </Button>
            </Box>
`;

content = content.replace('<Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Stores Management</Typography>', buttonCode);

const dialogUI = `
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Store</DialogTitle>
                <DialogContent dividers>
                    {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                    <Box display="grid" gap={2}>
                        <TextField
                            label="Store Name"
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Owner Full Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Owner Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Initial Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            fullWidth
                            required
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Subscription Plan</InputLabel>
                            <Select
                                value={formData.planId}
                                label="Subscription Plan"
                                onChange={(e) => setFormData({ ...formData, planId: e.target.value as string })}
                            >
                                {plans.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel>Billing Cycle</InputLabel>
                            <Select
                                value={formData.billingCycle}
                                label="Billing Cycle"
                                onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as string })}
                            >
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="yearly">Yearly</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)} disabled={submitting}>Cancel</Button>
                    <Button onClick={handleAddSubmit} variant="contained" disabled={submitting}>
                        {submitting ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
`;

content = content.replace('</TableContainer>\n        </Box>', '</TableContainer>\n' + dialogUI + '        </Box>');

fs.writeFileSync(filepath, content);
console.log('Patch Applied');
