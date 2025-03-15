import MasterLayout from '@/Layouts/MasterLayout';
import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, TextInput, Select, FileInput, Group, Loader, Alert, Pagination, Stack, SimpleGrid, InputLabel } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import RToolbar from "../Components/RToolbar";

const NewsEvents = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState("");
  const [pageInfo, setPageInfo] = useState({ page: 1, show: 10, orderBy: 'title', order: 'asc' });
  const [pagination, setPagination] = useState({ total: 0, lastPage: 1 });

  const loadData = () => {
    setLoading(true);
    axios.get(`/data/posts?page=${pageInfo.page}&show=${pageInfo.show}&orderBy=${pageInfo.orderBy}&order=${pageInfo.order}`)
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
      <Head title="News" />
      <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
        {errors && <Alert withCloseButton onClose={() => setErrors(null)}>{errors}</Alert>}
        <Stack>
          <div className="bg-white p-6 text-gray-900">
            <div className="flex justify-between mb-4">
              <h1 className="text-xl font-semibold">Products</h1>
              <CreatePost reload={loadData} />
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
                      <th className="p-3 border-b">Title</th>
                      <th className="p-3 border-b">Type</th>
                      <th className="p-3 border-b">Images</th>
                      <th className="p-3 border-b text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 border-b">
                        <td className="p-3">{item.title}</td>
                        <td className="p-3">{item.type}</td>
                        <td className="p-3 text-center">{item.images?.length > 0 ? <img src={'storage/' + item.images[0].image_path} className="h-16" alt="image" /> : '-'}</td>
                        <td className="p-3 flex gap-2 justify-end">
                          <EditItem item={item} reload={loadData} />
                          <RemoveItem item={item} reload={loadData} />
                        </td>
                      </tr>
                    )) : <tr><td colSpan="6" className="text-center p-4 text-gray-500">No post found.</td></tr>}
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

export default NewsEvents;

const CreatePost = ({ reload }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    initialValues: {
      title: "",
      type: "news",
      description: "",
      start_date: null,
      end_date: null,
      images: [],
    },
    validate: {
      title: (value) => (value ? null : "Title is required"),
      start_date: (value) => (form.values.type === 'event' && !value ? "Start date is required for events" : null),
      end_date: (value) => (form.values.type === 'event' && !value ? "End date is required for events" : null),
    },
  });

  const handleSubmit = (values) => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (key === "images") {
        values.images.forEach((file) => formData.append("images[]", file));
      } else {
        formData.append(key, values[key]);
      }
    });

    axios
      .post("/data/posts", formData)
      .then(() => {
        reload();
        close();
        form.reset();
      })
      .catch(() => setError("An error occurred while creating the post."))
      .finally(() => setLoading(false));
  };

  const desc = useEditor({
    extensions: [StarterKit],
    content: form.values.description,
    onUpdate: ({ editor }) => {
      form.setFieldValue('description', editor.getHTML());
    },
  });

  return (
    <>
      <Button onClick={open}>Create Post</Button>
      <Modal opened={opened} onClose={close} title="Create Post" size="70%">
        {error && (
          <Alert title="Error" color="red" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Title" required {...form.getInputProps("title")} />
          <Select
            label="Type"
            data={[
              { value: "news", label: "News" },
              { value: "event", label: "Event" },
              { value: "blog", label: "Blog" },
            ]}
            {...form.getInputProps("type")}
          />

          <div>
            <InputLabel size="sm" weight={500} mt={5}>
              Description
            </InputLabel>
            <RichTextEditor editor={desc} mt="md">
              <RToolbar />
              <RichTextEditor.Content />
            </RichTextEditor>
          </div>

          {form.values.type === 'event' && (
            <SimpleGrid cols={2} spacing="md" mt="md">
              <DatePickerInput
                label="Start Date"
                placeholder="Pick start date"
                value={form.values.start_date ? new Date(form.values.start_date) : null}
                onChange={(date) => form.setFieldValue("start_date", date || null)}
                clearable
              />

              <DatePickerInput
                label="End Date"
                placeholder="Pick end date"
                value={form.values.end_date ? new Date(form.values.end_date) : null}
                onChange={(date) => form.setFieldValue("end_date", date || null)}
                clearable
              />
            </SimpleGrid>
          )}

          <FileInput
            label="Product Images"
            placeholder="Upload product images"
            multiple
            accept="image/*"
            mt="md"
            {...form.getInputProps("images")}
          />

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

const EditItem = ({ item, reload }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      title: item.title,
      type: item.type,
      description: item.description,
      start_date: item.start_date ? new Date(item.start_date) : null,
      end_date: item.end_date ? new Date(item.end_date) : null,
      images: [],
    },
    validate: {
      title: (value) => (value ? null : "Title is required"),
    },
  });

  const handleSubmit = (values) => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      if (key === "images") {
        values.images.forEach((file) => formData.append("images[]", file));
      } else {
        formData.append(key, values[key]);
      }
    });

    axios
      .post(`/data/posts/${item.id}?_method=PUT`, formData)
      .then(() => {
        reload();
        close();
      })
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Button onClick={open}>Edit</Button>
      <Modal opened={opened} onClose={close} title="Edit Product" size="70%">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Title" required {...form.getInputProps("title")} />
          <Select
            label="Type"
            data={[
              { value: "news", label: "News" },
              { value: "event", label: "Event" },
              { value: "blog", label: "Blog" },
            ]}
            {...form.getInputProps("type")}
          />

          <div>
            <InputLabel size="sm" weight={500} mt={5}>
              Description
            </InputLabel>
            <RichTextEditor editor={useEditor({
              extensions: [StarterKit],
              content: form.values.description,
              onUpdate: ({ editor }) => {
                form.setFieldValue('description', editor.getHTML());
              }
            })} mt="md">
              <RToolbar />
              <RichTextEditor.Content />
            </RichTextEditor>
          </div>

          {form.values.type === 'event' && (
            <SimpleGrid cols={2} spacing="md" mt="md">
              <DatePickerInput
                label="Start Date"
                placeholder="Pick start date"
                value={form.values.start_date ? new Date(form.values.start_date) : null}
                onChange={(date) => form.setFieldValue("start_date", date || null)}
                clearable
              />

              <DatePickerInput
                label="End Date"
                placeholder="Pick end date"
                value={form.values.end_date ? new Date(form.values.end_date) : null}
                onChange={(date) => form.setFieldValue("end_date", date || null)}
                clearable
              />
            </SimpleGrid>
          )}

          <FileInput
            label="Product Images"
            placeholder="Upload product images"
            multiple
            accept="image/*"
            mt="md"
            {...form.getInputProps("images")}
          />

          <Group position="right" mt="lg">
            <Button onClick={close} variant="outline">
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Save
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
};

const RemoveItem = ({ item, reload }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    axios.delete(`/data/posts/${item.id}`)
      .then(() => { reload(); close(); })
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Button color="red" onClick={open}>Delete</Button>
      <Modal opened={opened} onClose={close} title="Confirm Delete">
        <p>Are you sure you want to delete this post?</p>
        <Button color="red" onClick={handleDelete} loading={loading} fullWidth>Delete</Button>
      </Modal>
    </>
  );
};


