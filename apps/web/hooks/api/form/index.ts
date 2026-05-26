import { trpc } from "~/trpc/client";

export const useCreateForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFormAsync,
    mutate: createForm,
    error,
    failureCount,
    isError,
    isPending,
    isSuccess,
    status,
  } = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      await utils.form.listForms.invalidate();
    },
  });

  return {
    createFormAsync,
    createForm,
    error,
    failureCount,
    isError,
    isPending,
    isSuccess,
    status,
  };
};

export const useListForms = () => {
  const {
    data: forms,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
    refetch,
  } = trpc.form.listForms.useQuery();

  return { forms, error, isFetched, isFetching, isLoading, status, refetch };
};

export const useGetFormBySlug = (slug: string) => {
  const {
    data: form,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getFormBySlug.useQuery({ slug });

  return { form, error, isFetched, isFetching, isLoading, status };
};

export const useGetFields = (formId: string) => {
  const {
    data: fields,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
    refetch,
  } = trpc.form.getFields.useQuery({ formId }, { enabled: !!formId });

  return { fields, error, isFetched, isFetching, isLoading, status, refetch };
};

export const useCreateField = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: createFieldAsync,
    mutate: createField,
    error,
    isError,
    isPending,
    isSuccess,
    status,
  } = trpc.form.createField.useMutation({
    onSuccess: async (_, variables) => {
      await utils.form.getFields.invalidate({ formId: variables.formId });
    },
  });

  return { createFieldAsync, createField, error, isError, isPending, isSuccess, status };
};

export const useUpdateField = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFieldAsync,
    mutate: updateField,
    error,
    isError,
    isPending,
    isSuccess,
    status,
  } = trpc.form.updateField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate({ formId });
    },
  });

  return { updateFieldAsync, updateField, error, isError, isPending, isSuccess, status };
};

export const useDeleteField = (formId: string) => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: deleteFieldAsync,
    mutate: deleteField,
    error,
    isError,
    isPending,
    isSuccess,
    status,
  } = trpc.form.deleteField.useMutation({
    onSuccess: async () => {
      await utils.form.getFields.invalidate({ formId });
    },
  });

  return { deleteFieldAsync, deleteField, error, isError, isPending, isSuccess, status };
};
