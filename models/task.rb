class Task
  include DataMapper::Resource
  storage_names[:default] = "t_service_tasklist"

  property :id,              Serial
  property :user_id,         Integer
  property :task_type,       String
  property :service_id,      String
  property :local_id,        Integer
  property :effective_date,  Date
  property :effective_time,  Time
  property :content,         Text
  property :state,           Integer

end
