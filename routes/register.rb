class ServiceRegisterController < SDN

  get '/' do
    content_type :json

    registers = Register.all
    logger.debug registers

    %Q({"count":#{registers.length}, "data":#{registers.to_json}})
  end

  post '/' do
    content_type :json

    content = '{"connConstraint":{"requestedCapacity":{"committedInformationRate":%s,"totalSize":%s}}}'
    if params['everyday']
      @t1 = Task.new(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_time => params['startAt'],
        :content => content % [params['rate'], params['bandwidth']],
        :state => 0
      )

      @t2 = Task.new(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10).to_s,
        :service_id => params['service']['name'][0]['value'],
        :effective_time => params['endAt'],
        :content => content % [params['service']['connConstraint']['requestedCapacity']['committedInformationRate'], params['service']['connConstraint']['requestedCapacity']['totalSize']],
        :state => 0
      )
    else
      @t1 = Task.new(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10),
        :service_id => params['service']['name'][0]['value'],
        :effective_date => params['date'],
        :effective_time => params['startAt'],
        :content => content % [params['service']['connConstraint']['requestedCapacity']['committedInformationRate'], params['service']['connConstraint']['requestedCapacity']['totalSize']],
        :state => 0
      )

      @t2 = Task.new(
        :task_type => 'tapi_mod_srv',
        :local_id  => DateTime.now.strftime("%Y%m%d%H%M%S%L")+rand(10),
        :service_id => params['service']['name'][0]['value'],
        :effective_date => params['date'],
        :effective_time => params['endAt'],
        :content => content % [params['service']['connConstraint']['requestedCapacity']['committedInformationRate'], params['service']['connConstraint']['requestedCapacity']['totalSize']],
        :state => 0
      )
    end
    @register = Register.new(
      :service => params['service']['name'][0]['value'],
      :rate => params['rate'],
      :bandwidth => params['bandwidth'],
      :effective_date => params['date'],
      :startAt => params['startAt'],
      :endAt => params['endAt'],
      :everyday => params['everyday']
    )

    if @t1.save and @t2.save and @register.save
      [200, %Q({"message":"done!"})]
    else
       @t1.errors.each do |e|
         logger.debug e
       end
       @t2.errors.each do |e|
         logger.debug e
       end
       @register.errors.each do |e|
         logger.debug e
       end
      [500, %Q({"message":"failure!"})]
    end

  end

  before do
    if request.request_method == "POST"
      body_parameters = request.body.read
      params.merge!(JSON.parse(body_parameters))
    end
  end
end
