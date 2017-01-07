class Task
  include DataMapper::Resource
  storage_names[:default] = "t_service_tasklist"

  property :id,              Serial
  property :task_type,       Integer
  property :service_id,      Integer
  property :local_id,        Integer
  property :effective_time,  DateTime
  property :content,         Text
  property :state,           Integer

end
