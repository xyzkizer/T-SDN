class ManagerController < SDN

  get '/' do
    content_type :json

    users = {}
    users[:data] = Manager.all
    users[:count] = users[:data].length

    users.to_json
  end

  post %r{/(?<username>.+)/?} do
    content_type :json

    logger.debug params
    @user = Manager.all(:username => params['username']).update(
      :name => params['name'],
      :password => params['password'],
      :email => params['email'],
      :role => params['role'],
      :mobile => params['mobile']
    )
    if @user
      [200, %Q({"message":"done!"})]
    else
      @user.errors.each do |e|
        logger.debug e
      end
      [500, %Q({"message":"failure!"})]
    end
  end

  delete %r{/(?<names>.+)/?} do
    logger.debug params
    Manager.all(:username => params['names'].split(',')).destroy
    # params['names'].split(',').each do |name|
    # end
    [200, %Q({"message":"done!"})]
  end

  post '/?' do
    content_type :json

    logger.debug params
    @user = Manager.create(
      :name => params['name'],
      :username => params['username'],
      :password => params['password'],
      :email => params['email'],
      :role => params['role'],
      :mobile => params['mobile']
    )
    if @user
      [200, %Q({"message":"done!"})]
    else
      @user.errors.each do |e|
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
