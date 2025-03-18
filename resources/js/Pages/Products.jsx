import MasterLayout from '@/Layouts/MasterLayout';
import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, TextInput, Select, FileInput, Group, MultiSelect, Loader, Alert, Pagination, Stack, SimpleGrid, InputLabel, Image, Card, Text } from '@mantine/core';
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import RToolbar from "../Components/RToolbar";

const Products = () => {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [errors, setErrors] = useState("");
	const [pageInfo, setPageInfo] = useState({ page: 1, show: 10, orderBy: 'name', order: 'asc' });
	const [pagination, setPagination] = useState({ total: 0, lastPage: 1 });

	const loadData = () => {
		setLoading(true);
		axios.get(`/data/products?page=${pageInfo.page}&show=${pageInfo.show}&orderBy=${pageInfo.orderBy}&order=${pageInfo.order}`)
			.then(res => {
				setItems(res.data.data);
				setPagination({ total: res.data.total, lastPage: res.data.last_page });
			})
			.catch(error => setErrors(error.response?.data?.message))
			.finally(() => setLoading(false));
	};

	useEffect(() => { loadData(); }, [pageInfo]);
	useEffect(() => { if (errors) setTimeout(() => setErrors(null), 5000); }, [errors]);

	return (
		<MasterLayout>
			<Head title="Products" />
			<div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
				{errors && <Alert withCloseButton onClose={() => setErrors(null)}>{errors}</Alert>}
				<Stack>
					<div className="bg-white p-6 text-gray-900">
						<div className="flex justify-between mb-4">
							<h1 className="text-xl font-semibold">Products</h1>
							<div className="">
							<ImportProducts reload={loadData}/>
							<CreateProduct reload={loadData} />
							</div>
						</div>
						{loading ? (
							<div className="flex justify-center">
								<Loader className="mx-auto" />
							</div>
						) : !items ? (
							<div className="flex justify-center">
								<span>No Items</span>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse border border-gray-200 shadow-md">
									<thead>
										<tr className='bg-gray-100 text-left'>
											<th className="p-3 border-b">Name</th>
											<th className="p-3 border-b">Category</th>
											<th className="p-3 border-b">Variant</th>
											<th className="p-3 border-b">Trade Name</th>
											<th className="p-3 border-b">Images</th>
											<th className="p-3 border-b text-right">Actions</th>
										</tr>
									</thead>
									<tbody>
										{items.length > 0 ? items.map(item => (
											<tr key={item.id} className="hover:bg-gray-50 border-b">
												<td className="p-3">{item.name}</td>
												<td className="p-3">{item.category?.name + "(" + item.category?.type + ")"}</td>
												<td className="p-3">{item.variant}</td>
												<td className="p-3">{item.trade_name || '-'}</td>
												<td className="p-3 text-center">{item.images?.length > 0 ? <img src={'storage/' + item.images[0].image_path} className="h-16" alt="product" /> : '-'}</td>
												<td className="p-3 flex gap-2 justify-end">
													<ProductImages item={item} reload={loadData} />
													<EditProduct item={item} reload={loadData} />
													<RemoveProduct item={item} reload={loadData} />
												</td>
											</tr>
										)) : <tr><td colSpan="6" className="text-center p-4 text-gray-500">No products found.</td></tr>}
									</tbody>
								</table>
							</div>
						)}
						<Pagination total={pagination.lastPage} value={pageInfo.page} onChange={(page) => setPageInfo((prev) => ({ ...prev, page }))} className="mt-4" />
					</div>
				</Stack>
			</div>
		</MasterLayout>
	);
};

export default Products;

const CreateProduct = ({ reload }) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		axios
			.get("/data/categories?show=all")
			.then((response) => setCategories(response.data))
			.catch(() => setError("Failed to load categories"));
	}, []);

	const form = useForm({
		initialValues: {
			name: "",
			category_id: "",
			variant: "na",
			trade_name: "",
			other_names: [],
			botanical_name: "",
			general_info: "",
			origin_sourcing: "",
			quality_certifications: "",
			characteristics: "",
			packaging_shelf_life: "",
			moq: "",
		},
		validate: {
			name: (value) => (value ? null : "Name is required"),
			category_id: (value) => (value ? null : "Category is required"),
		},
	});

	const handleSubmit = (values) => {
		setLoading(true);
		const formData = new FormData();
		Object.keys(values).forEach((key) => {
			if (key === "other_names") {
				formData.append(key, JSON.stringify(values[key]));
			} else {
				formData.append(key, values[key]);
			}
		});

		axios
			.post("/data/products", formData)
			.then(() => {
				reload();
				close();
				form.reset();
			})
			.catch(() => setError("An error occurred while creating the product."))
			.finally(() => setLoading(false));
	};

	const g_info = useEditor({
		extensions: [StarterKit],
		content: form.values.general_info,
		onUpdate: ({ editor }) => {
			form.setFieldValue('general_info', editor.getHTML());
		},
	});

	const handleOtherNamesChange = (e) => {
		const value = e.target.value.split(",").map((name) => name.trim());
		form.setFieldValue("other_names", value);
	};

	return (
		<>
			<Button onClick={open}>Create Product</Button>
			<Modal opened={opened} onClose={close} title="Create Product" size="70%">
				{error && (
					<Alert title="Error" color="red" withCloseButton onClose={() => setError(null)}>
						{error}
					</Alert>
				)}
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<TextInput label="Name" required {...form.getInputProps("name")} />
					<SimpleGrid cols={2} spacing="md">
						<Select
							label="Category"
							data={categories.map((c) => ({
								value: String(c.id),
								label: `${c.name}${c.type !== "na" ? ` (${c.type})` : ""}`,
							}))}
							required
							{...form.getInputProps("category_id")}
						/>
						<Select
							label="Variant"
							data={[
								{ value: "whole", label: "Whole" },
								{ value: "powder", label: "Powder" },
								{ value: "flakes", label: "Flakes" },
								{ value: "slice", label: "Slice" },
								{ value: "na", label: "N/A" },
							]}
							{...form.getInputProps("variant")}
						/>
						<TextInput label="Trade Name" {...form.getInputProps("trade_name")} />
						<TextInput label="Botanical Name" {...form.getInputProps("botanical_name")} />
					</SimpleGrid>

					<div>
						<TextInput label="Other Names" onChange={handleOtherNamesChange} />
					</div>
					<div>
						<InputLabel size="sm" weight={500} mt={5}>
							General Information
						</InputLabel>
						<RichTextEditor editor={g_info} mt="md">
							<RToolbar />
							<RichTextEditor.Content />
						</RichTextEditor>
					</div>

					<SimpleGrid cols={2} spacing="md" mt="md">
						<TextInput label="Origin & Sourcing" {...form.getInputProps("origin_sourcing")} />
						<TextInput label="Quality Certifications" {...form.getInputProps("quality_certifications")} />
						<TextInput label="Characteristics" {...form.getInputProps("characteristics")} />
						<TextInput label="Packaging & Shelf Life" {...form.getInputProps("packaging_shelf_life")} />
					</SimpleGrid>

					<SimpleGrid cols={2} spacing="md" mt="md">
						<TextInput label="Minimum Order Quantity (MOQ)" {...form.getInputProps("moq")} />
						
					</SimpleGrid>

					<Group position="right" mt="lg">
						<Button onClick={close} variant="outline">
							Cancel
						</Button>
						<Button type="submit" loading={loading}>
							Create
						</Button>
					</Group>
				</form>
			</Modal>
		</>
	);
};

const EditProduct = ({ item, reload }) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const form = useForm({
		initialValues: {
			name: item.name || "",
			category_id: String(item.category_id) || "",
			variant: item.variant || "na",
			trade_name: item.trade_name || "",
			other_names: item.other_names ? item.other_names.join(", ") : "", // Convert array to comma-separated string
			botanical_name: item.botanical_name || "", // Ensure botanical_name is included
			general_info: item.general_info || "",
			origin_sourcing: item.origin_sourcing || "",
			quality_certifications: item.quality_certifications || "",
			characteristics: item.characteristics || "",
			packaging_shelf_life: item.packaging_shelf_life || "",
			moq: item.moq || "",
		},
		validate: {
			name: (value) => (value ? null : "Name is required"),
			category_id: (value) => (value ? null : "Category is required"),
		},
	});

	useEffect(() => {
		axios
			.get("/data/categories?show=all")
			.then((response) => setCategories(response.data))
			.catch(() => setError("Failed to load categories"));
	}, []);

	const handleSubmit = (values) => {
		setLoading(true);
		const formData = new FormData();
		formData.append("_method", "PUT");

		// Convert other_names back to an array before appending to FormData
		const otherNamesArray = values.other_names
			.split(",")
			.map((name) => name.trim())
			.filter((name) => name !== "");

		Object.keys(values).forEach((key) => {
			if (values[key] !== undefined && values[key] !== null) {
				if (key === "other_names") {
					formData.append(key, JSON.stringify(otherNamesArray)); // Append as JSON array
				} else {
					formData.append(key, values[key]);
				}
			}
		});

		axios
			.post(`/data/products/${item.id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			})
			.then(() => {
				reload();
				close();
			})
			.catch((error) => {
				console.error("Update error:", error);
				setError("An error occurred while updating the product.");
			})
			.finally(() => setLoading(false));
	};

	const g_info = useEditor({
		extensions: [StarterKit],
		content: form.values.general_info,
		onUpdate: ({ editor }) => {
			form.setFieldValue("general_info", editor.getHTML());
		},
	});

	return (
		<>
			<Button onClick={open}>Edit</Button>
			<Modal opened={opened} onClose={close} title="Edit Product" size="70%">
				{error && (
					<Alert title="Error" color="red" withCloseButton onClose={() => setError(null)}>
						{error}
					</Alert>
				)}
				<form onSubmit={form.onSubmit(handleSubmit)}>
					<TextInput label="Name" required {...form.getInputProps("name")} />
					<SimpleGrid cols={2} spacing="md">
						<Select
							label="Category"
							data={categories.map((c) => ({
								value: String(c.id),
								label: `${c.name}${c.type !== "na" ? ` (${c.type})` : ""}`,
							}))}
							required
							{...form.getInputProps("category_id")}
						/>
						<Select
							label="Variant"
							data={[
								{ value: "whole", label: "Whole" },
								{ value: "powder", label: "Powder" },
								{ value: "flakes", label: "Flakes" },
								{ value: "slice", label: "Slice" },
								{ value: "na", label: "N/A" },
							]}
							{...form.getInputProps("variant")}
						/>
						<TextInput label="Trade Name" {...form.getInputProps("trade_name")} />
						<TextInput label="Botanical Name" {...form.getInputProps("botanical_name")} /> {/* Add botanical_name field */}
						<TextInput
							label="Other Names"
							value={form.values.other_names}
							onChange={(e) => form.setFieldValue("other_names", e.target.value)} // Handle other_names as comma-separated string
						/>
					</SimpleGrid>

					<div>
						<InputLabel size="sm" weight={500} mt={5}>
							General Information
						</InputLabel>
						<RichTextEditor editor={g_info} mt="md">
							<RToolbar />
							<RichTextEditor.Content />
						</RichTextEditor>
					</div>

					<SimpleGrid cols={2} spacing="md" mt="md">
						<TextInput label="Origin & Sourcing" {...form.getInputProps("origin_sourcing")} />
						<TextInput label="Quality Certifications" {...form.getInputProps("quality_certifications")} />
						<TextInput label="Characteristics" {...form.getInputProps("characteristics")} />
						<TextInput label="Packaging & Shelf Life" {...form.getInputProps("packaging_shelf_life")} />
					</SimpleGrid>

					<SimpleGrid cols={2} spacing="md" mt="md">
						<TextInput label="Minimum Order Quantity (MOQ)" {...form.getInputProps("moq")} />
					</SimpleGrid>

					<Group position="right" mt="lg">
						<Button onClick={close} variant="outline">
							Cancel
						</Button>
						<Button type="submit" loading={loading}>
							Update
						</Button>
					</Group>
				</form>
			</Modal>
		</>
	);
};

const RemoveProduct = ({ item, reload }) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [loading, setLoading] = useState(false);
	const handleDelete = () => {
		setLoading(true);
		axios.delete(`/data/products/${item.id}`)
			.then(() => { reload(); close(); })
			.catch(error => console.error(error))
			.finally(() => setLoading(false));
	};

	return (
		<>
			<Button color="red" onClick={open}>Delete</Button>
			<Modal opened={opened} onClose={close} title="Confirm Delete">
				<p>Are you sure you want to delete this product?</p>
				<Button color="red" onClick={handleDelete} loading={loading} fullWidth>Delete</Button>
			</Modal>
		</>
	);
};

const ProductImages = ({ item, reload }) => {
	const [opened, { open, close }] = useDisclosure(false);
	const [newImages, setNewImages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const handleRemoveImage = async (imageId) => {
		try {
			await axios.delete(`/data/product_images/${imageId}`);
			alert("Image deleted successfully!");
			reload();
			close();
		} catch (error) {
			console.error("Error deleting image:", error.response?.data || error.message);
			alert("Failed to delete the image.");
		}
	};

	const handleSaveImages = async () => {
		setLoading(true);
		const formData = new FormData();

		// Append each image file separately
		newImages.forEach((file) => {
			formData.append("images[]", file); // Important: Ensure "images[]" is used correctly
		});

		try {
			await axios.post(`/data/products/${item.id}/images`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			reload(); // Refresh product images after upload
			close();
		} catch (error) {
			console.error("Image upload error:", error.response?.data || error.message);
			setError("An error occurred while uploading images.");
		} finally {
			setLoading(false);
		}
	};

	const handleImageUpload = (files) => {
		setNewImages((prevImages) => [...prevImages, ...files]);
	};

	return (
		<>
			<Button onClick={open}>Manage Images</Button>
			<Modal opened={opened} onClose={close} title="Manage Product Images" size="70%">
				{error && (
					<Alert title="Error" color="red" withCloseButton onClose={() => setError(null)}>
						{error}
					</Alert>
				)}
				<Stack>
					<FileInput
						label="Upload New Images"
						multiple
						onChange={handleImageUpload}
					/>
					<SimpleGrid cols={3}>
						{item.images?.map((image, index) => (
							<Card key={index} shadow="sm" p="lg">
								<Card.Section>
									<Image src={`storage/${image.image_path}`} alt={`Product Image ${index + 1}`} />
								</Card.Section>
								<Group position="apart" mt="md">
									<Text weight={500}>Image {index + 1}</Text>
									<Button color="red" onClick={() => handleRemoveImage(image.id)}>Remove</Button>
								</Group>
							</Card>
						))}
					</SimpleGrid>
					<Group position="right">
						<Button onClick={close} variant="outline">Cancel</Button>
						<Button onClick={handleSaveImages} loading={loading}>Save</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
};

const ImportProducts = ({ reload }) => {
	const [opened, { open, close }] = useDisclosure(false);
	
	return (
		<>
			<Button onClick={open}>Import Products</Button>
			<Modal opened={opened} onClose={close} title="Create Product" size="70%">
				<div>import will be added here</div>
			</Modal>
		</>
	);
};
