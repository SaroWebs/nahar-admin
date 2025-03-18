import MasterLayout from '@/Layouts/MasterLayout';
import React, { useEffect, useState, useRef} from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { Modal, Card, Button, TextInput, Select, Group, Loader, Alert, Pagination, Stack, SimpleGrid, InputLabel, Text } from '@mantine/core';
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
              <h1 className="text-xl font-semibold">Posts</h1>
              <CreatePost reload={loadData} />
            </div>
            {loading ? (
              <div className="flex justify-center">
                <Loader className="mx-auto" />
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
                        <td className="p-3 text-center">
                          <PostImages item={item} reload={loadData} />
                        </td>
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
      formData.append(key, values[key]);
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
    },
    validate: {
      title: (value) => (value ? null : "Title is required"),
    },
  });

  const handleSubmit = (values) => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
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
      <Modal opened={opened} onClose={close} title="Edit Post" size="70%">
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
                clearable
                {...form.getInputProps("start_date")}
              />
              <DatePickerInput
                label="End Date"
                placeholder="Pick end date"
                clearable
                {...form.getInputProps("end_date")}
              />
            </SimpleGrid>
          )}

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


const PostImages = ({ item, reload }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleRemoveImage = async (imageId) => {
    try {
      await axios.delete(`/data/post_images/${imageId}`);
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

    newImages.forEach((file) => {
      formData.append("images[]", file);
    });

    try {
      await axios.post(`/data/posts/${item.id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      reload();
      close();
    } catch (error) {
      console.error("Image upload error:", error.response?.data || error.message);
      setError("An error occurred while uploading images.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    console.log("event");
    console.log(event);
    const files = Array.from(event.target.files);
    console.log("files");
    console.log(files);
    setNewImages((prevImages) => [...prevImages, ...files]);
  };

  return (
    <>
      <div onClick={open} className="flex flex-wrap gap-2 justify-center cursor-pointer">
        {item.images?.length > 0 ? (
          item.images.map((image, index) => (
            <img key={index} src={`/storage/${image.image_path}`} className="h-16 w-16 object-cover border rounded" alt={`Post ${item.id}`} />
          ))
        ) : (
          <span className="text-gray-500">No Images</span>
        )}
      </div>
      <Modal opened={opened} onClose={close} title="Manage Post Images" size="70%">
        {error && (
          <Alert title="Error" color="red" withCloseButton onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        <Stack>
          {/* Styled Div as File Input Trigger */}
          <div
            className="border-dashed border-2 border-gray-400 rounded-lg p-5 text-center cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <p className="text-gray-600">Add Images</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
          />
          {/* Image Preview */}
          <SimpleGrid cols={3}>
            {newImages.map((file, index) => (
              <Card key={index} shadow="sm" p="lg">
                <Card.Section>
                  <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                </Card.Section>
                <Group position="apart" mt="md">
                  <Text weight={500}>Preview {index + 1}</Text>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
          {/* Existing Images */}
          <SimpleGrid cols={3}>
            {item.images?.map((image, index) => (
              <Card key={index} shadow="sm" p="lg">
                <Card.Section>
                  <img src={`storage/${image.image_path}`} alt={`Post Image ${index + 1}`} />
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
